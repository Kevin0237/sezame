const { query } = require('../config/db')
const { sendVerificationStatusEmail } = require('./email.service')

async function listVerifications() {
  const result = await query(
    `SELECT c.id, c.user_id, c.name, c.city, c.verification_doc_url, c.status, c.created_at,
            u.email
     FROM companies c
     JOIN users u ON u.id = c.user_id
     WHERE c.status = 'pending'
     ORDER BY c.created_at ASC`,
  )

  return result.rows.map((r) => ({
    userId: r.user_id,
    companyName: r.name,
    city: r.city || '',
    doc_url: r.verification_doc_url || '',
    submitted_at: r.created_at,
    email: r.email,
  }))
}

async function resolveVerification(userId, action) {
  const newStatus = action === 'approve' ? 'verified' : 'rejected'

  const result = await query(
    `UPDATE companies SET status = $1, updated_at = NOW()
     WHERE user_id = $2
     RETURNING id, name`,
    [newStatus, userId],
  )

  if (!result.rows.length) {
    const err = new Error('Demande introuvable.')
    err.status = 404
    throw err
  }

  sendVerificationStatusEmail({
    userId,
    companyName: result.rows[0].name,
    status: newStatus,
  }).catch(() => {})

  return { message: newStatus === 'verified' ? 'Entreprise approuvée.' : 'Demande refusée.' }
}

async function listReports() {
  const result = await query(
    `SELECT r.id, r.target_type, r.target_id, r.reason, r.reported_at
     FROM reports r
     ORDER BY r.reported_at DESC`,
  )

  const reports = await Promise.all(
    result.rows.map(async (row) => {
      let title = null
      let companyName = null

      if (row.target_type === 'offer') {
        const offerResult = await query(
          `SELECT o.title, c.name AS company_name
           FROM offers o
           LEFT JOIN companies c ON c.id = o.company_id
           WHERE o.id = $1`,
          [row.target_id],
        )
        if (offerResult.rows.length) {
          title = offerResult.rows[0].title
          companyName = offerResult.rows[0].company_name
        }
      }

      return {
        id: row.id,
        targetType: row.target_type,
        targetId: row.target_id,
        reason: row.reason,
        reportedAt: row.reported_at,
        title,
        companyName,
      }
    }),
  )

  return reports
}

async function disableOffer(offerId) {
  const result = await query(
    `UPDATE offers SET status = 'disabled', updated_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [offerId],
  )

  if (!result.rows.length) {
    const err = new Error('Offre introuvable.')
    err.status = 404
    throw err
  }

  return { message: 'Offre désactivée.' }
}

async function listAccounts({ q } = {}) {
  let sql = `SELECT id, email, name, first_name, last_name, role, is_active FROM users`
  const values = []

  if (q) {
    sql += ` WHERE email ILIKE $1 OR name ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1`
    values.push(`%${q}%`)
  }

  sql += ` ORDER BY created_at DESC`

  const result = await query(sql, values)

  return result.rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name || `${r.first_name} ${r.last_name}`.trim(),
    role: r.role,
    disabled: !r.is_active,
  }))
}

async function setAccountDisabled(userId, disabled) {
  const result = await query(
    `UPDATE users SET is_active = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id`,
    [!disabled, userId],
  )

  if (!result.rows.length) {
    const err = new Error('Utilisateur introuvable.')
    err.status = 404
    throw err
  }

  return { message: disabled ? 'Compte désactivé.' : 'Compte réactivé.' }
}

async function getDashboard() {
  const [activeUsersResult, offersToModerateResult, pendingCompaniesResult, reportsResult, verificationsResult, geoResult] =
    await Promise.all([
      query('SELECT COUNT(*)::int AS cnt FROM users WHERE is_active = TRUE'),
      query("SELECT COUNT(*)::int AS cnt FROM offers WHERE status = 'active'"),
      query("SELECT COUNT(*)::int AS cnt FROM companies WHERE status = 'pending'"),
      query('SELECT COUNT(*)::int AS cnt FROM reports'),
      listVerifications(),
      query(
        `SELECT city, COUNT(*)::int AS cnt
         FROM users u
         LEFT JOIN profiles p ON p.user_id = u.id
         WHERE p.city IS NOT NULL AND p.city != ''
         GROUP BY city
         ORDER BY cnt DESC
         LIMIT 5`,
      ),
    ])

  const totalUsers = activeUsersResult.rows[0].cnt
  const reportsCount = reportsResult.rows[0].cnt
  const totalOffers = offersToModerateResult.rows[0].cnt + reportsCount

  const totalGeoCount = geoResult.rows.reduce((sum, r) => sum + r.cnt, 0) || 1
  const geo = geoResult.rows.map((r) => ({
    city: r.city,
    count: r.cnt,
    percent: Math.round((r.cnt / totalGeoCount) * 100),
  }))

  return {
    activeUsers: totalUsers,
    offersToModerate: reportsCount,
    pendingCompanies: pendingCompaniesResult.rows[0].cnt,
    conversionRate: totalUsers > 0 ? Math.round((totalOffers / totalUsers) * 100 * 10) / 10 : 0,
    verifications: verificationsResult,
    reports: await listReports(),
    geo,
    logs: [],
  }
}

module.exports = {
  listVerifications,
  resolveVerification,
  listReports,
  disableOffer,
  listAccounts,
  setAccountDisabled,
  getDashboard,
}
