const { query, pool } = require('../config/db')
const { createNotification } = require('./notification.service')
const { sendApplicationStatusEmail } = require('./email.service')

const statusLabels = {
  submitted: 'Envoyée',
  viewed: 'Vue',
  in_review: 'En cours d\'examen',
  accepted: 'Acceptée',
  rejected: 'Refusée',
}

async function createApplication(userId, offerId) {
  const offerResult = await query(
    "SELECT id, company_id FROM offers WHERE id = $1 AND status = 'active'",
    [offerId],
  )
  if (!offerResult.rows.length) {
    const err = new Error('Offre introuvable ou inactive.')
    err.status = 404
    throw err
  }

  const profileResult = await query(
    'SELECT id FROM profiles WHERE user_id = $1',
    [userId],
  )
  if (!profileResult.rows.length) {
    const err = new Error('Profil introuvable.')
    err.status = 404
    throw err
  }

  const profileId = profileResult.rows[0].id

  const existing = await query(
    'SELECT id FROM applications WHERE offer_id = $1 AND profile_id = $2',
    [offerId, profileId],
  )
  if (existing.rows.length) {
    const err = new Error('Vous avez déjà postulé à cette offre.')
    err.status = 409
    throw err
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const appResult = await client.query(
      `INSERT INTO applications (offer_id, profile_id, status)
       VALUES ($1, $2, 'submitted')
       RETURNING id, offer_id, profile_id, status, applied_at, updated_at`,
      [offerId, profileId],
    )

    const app = appResult.rows[0]

    await client.query(
      `INSERT INTO application_status_history (application_id, status)
       VALUES ($1, 'submitted')`,
      [app.id],
    )

    await client.query('COMMIT')

    return {
      id: app.id,
      offerId: app.offer_id,
      userId,
      status: app.status,
      appliedAt: app.applied_at,
      updatedAt: app.updated_at,
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

async function listMyApplications(userId) {
  const profileResult = await query(
    'SELECT id FROM profiles WHERE user_id = $1',
    [userId],
  )
  if (!profileResult.rows.length) return []

  const profileId = profileResult.rows[0].id

  const result = await query(
    `SELECT a.id, a.offer_id, a.status, a.applied_at, a.updated_at
     FROM applications a
     WHERE a.profile_id = $1
     ORDER BY a.applied_at DESC`,
    [profileId],
  )

  const applications = await Promise.all(
    result.rows.map(async (row) => {
      const offerResult = await query(
        `SELECT o.id, o.title, o.city, o.type, o.contract_type, o.min_salary, o.max_salary
         FROM offers o WHERE o.id = $1`,
        [row.offer_id],
      )
      const offer = offerResult.rows[0] || null

      let company = null
      if (offer) {
        const companyResult = await query(
          'SELECT id, name, city FROM companies WHERE id = (SELECT company_id FROM offers WHERE id = $1)',
          [row.offer_id],
        )
        company = companyResult.rows[0] || null
      }

      return {
        id: row.id,
        offerId: row.offer_id,
        userId,
        status: row.status,
        appliedAt: row.applied_at,
        updatedAt: row.updated_at,
        offer: offer ? { ...offer, company } : null,
      }
    }),
  )

  return applications
}

async function getApplication(userId, applicationId) {
  const result = await query(
    `SELECT a.id, a.offer_id, a.profile_id, a.status, a.applied_at, a.updated_at
     FROM applications a
     WHERE a.id = $1`,
    [applicationId],
  )

  if (!result.rows.length) {
    const err = new Error('Candidature introuvable.')
    err.status = 404
    throw err
  }

  const app = result.rows[0]

  const historyResult = await query(
    `SELECT status, created_at AS at
     FROM application_status_history
     WHERE application_id = $1
     ORDER BY created_at ASC`,
    [applicationId],
  )

  const offerResult = await query(
    `SELECT o.id, o.title, o.city, o.type, o.contract_type, o.min_salary, o.max_salary, o.description, o.deadline
     FROM offers o WHERE o.id = $1`,
    [app.offer_id],
  )
  const offer = offerResult.rows[0] || null

  let company = null
  if (offer) {
    const companyResult = await query(
      'SELECT id, name, city FROM companies WHERE id = (SELECT company_id FROM offers WHERE id = $1)',
      [app.offer_id],
    )
    company = companyResult.rows[0] || null
  }

  const userResult = await query(
    `SELECT u.id, u.email, u.name, u.first_name, u.last_name, u.avatar
     FROM users u
     JOIN profiles p ON p.user_id = u.id
     WHERE p.id = $1`,
    [app.profile_id],
  )
  const candidate = userResult.rows[0] || null

  const profileResult = await query(
    `SELECT id, bio, title, city, skills, school, field_of_study
     FROM profiles WHERE id = $1`,
    [app.profile_id],
  )
  const profile = profileResult.rows[0] || null

  return {
    id: app.id,
    offerId: app.offer_id,
    userId: candidate?.id || userId,
    status: app.status,
    appliedAt: app.applied_at,
    updatedAt: app.updated_at,
    history: historyResult.rows.map((h) => ({ status: h.status, at: h.at })),
    offer: offer ? { ...offer, company } : null,
    candidate,
    profile: profile
      ? {
          ...profile,
          skills: profile.skills || [],
        }
      : null,
  }
}

async function updateApplicationStatus(userId, applicationId, newStatus) {
  const appResult = await query(
    `SELECT a.id, a.status, a.offer_id, a.profile_id
     FROM applications a
     WHERE a.id = $1`,
    [applicationId],
  )

  if (!appResult.rows.length) {
    const err = new Error('Candidature introuvable.')
    err.status = 404
    throw err
  }

  const app = appResult.rows[0]

  const companyResult = await query(
    `SELECT c.id FROM companies c
     JOIN offers o ON o.company_id = c.id
     WHERE o.id = $1 AND c.user_id = $2`,
    [app.offer_id, userId],
  )

  if (!companyResult.rows.length) {
    const err = new Error('Non autorisé.')
    err.status = 403
    throw err
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(
      "UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2",
      [newStatus, applicationId],
    )

    await client.query(
      `INSERT INTO application_status_history (application_id, status)
       VALUES ($1, $2)`,
      [applicationId, newStatus],
    )

    await client.query('COMMIT')

    const updated = await query(
      'SELECT id, offer_id, status, applied_at, updated_at FROM applications WHERE id = $1',
      [applicationId],
    )
    const row = updated.rows[0]

    const label = statusLabels[newStatus] || newStatus

    query(
      `SELECT u.id AS user_id, u.email AS user_email, o.title AS offer_title
       FROM profiles p
       JOIN users u ON u.id = p.user_id
       JOIN offers o ON o.id = $1
       WHERE p.id = $2`,
      [app.offer_id, app.profile_id],
    )
      .then(async (meta) => {
        if (!meta.rows.length) return
        const { user_id, user_email, offer_title } = meta.rows[0]
        await createNotification(user_id, {
          type: 'application_status',
          content: `Votre candidature pour « ${offer_title} » est maintenant : ${label}.`,
          link: '/app/student/applications',
        })
        sendApplicationStatusEmail({
          to: user_email,
          offerTitle: offer_title,
          newStatus,
          statusLabel: label,
        }).catch(() => {})
      })
      .catch(() => {})

    return {
      id: row.id,
      offerId: row.offer_id,
      status: row.status,
      appliedAt: row.applied_at,
      updatedAt: row.updated_at,
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

async function listOfferApplications(userId, offerId) {
  const companyCheck = await query(
    `SELECT c.id FROM companies c
     JOIN offers o ON o.company_id = c.id
     WHERE o.id = $1 AND c.user_id = $2`,
    [offerId, userId],
  )

  if (!companyCheck.rows.length) {
    const err = new Error('Non autorisé.')
    err.status = 403
    throw err
  }

  const result = await query(
    `SELECT a.id, a.profile_id, a.status, a.applied_at, a.updated_at
     FROM applications a
     WHERE a.offer_id = $1
     ORDER BY a.applied_at DESC`,
    [offerId],
  )

  const applications = await Promise.all(
    result.rows.map(async (row) => {
      const userResult = await query(
        `SELECT u.id, u.email, u.name, u.first_name, u.last_name, u.avatar
         FROM users u
         JOIN profiles p ON p.user_id = u.id
         WHERE p.id = $1`,
        [row.profile_id],
      )
      const candidate = userResult.rows[0] || null

      const profileResult = await query(
        `SELECT id, title, city, skills, bio FROM profiles WHERE id = $1`,
        [row.profile_id],
      )
      const profile = profileResult.rows[0] || null

      return {
        id: row.id,
        offerId,
        userId: candidate?.id,
        status: row.status,
        appliedAt: row.applied_at,
        updatedAt: row.updated_at,
        candidate,
        profile: profile ? { ...profile, skills: profile.skills || [] } : null,
      }
    }),
  )

  return applications
}

async function getRecruiterDashboard(userId) {
  const companyResult = await query(
    'SELECT id, name, city FROM companies WHERE user_id = $1',
    [userId],
  )

  if (!companyResult.rows.length) {
    return {
      totalApplications: 0,
      newApplications: 0,
      inInterview: 0,
      activeOffers: 0,
      views: 0,
      recentOffers: [],
      suggestedTalents: [],
    }
  }

  const companyId = companyResult.rows[0].id

  const offersResult = await query(
    'SELECT id FROM offers WHERE company_id = $1',
    [companyId],
  )
  const offerIds = offersResult.rows.map((r) => r.id)

  let totalApps = 0
  let newApps = 0
  let inInterview = 0

  if (offerIds.length) {
    const appStats = await query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'submitted')::int AS new_count,
         COUNT(*) FILTER (WHERE status = 'in_review')::int AS interview_count
       FROM applications
       WHERE offer_id = ANY($1)`,
      [offerIds],
    )
    totalApps = appStats.rows[0].total
    newApps = appStats.rows[0].new_count
    inInterview = appStats.rows[0].interview_count
  }

  const activeResult = await query(
    "SELECT COUNT(*)::int AS cnt FROM offers WHERE company_id = $1 AND status = 'active'",
    [companyId],
  )

  const viewsResult = await query(
    'SELECT COALESCE(SUM(views), 0)::int AS total FROM offers WHERE company_id = $1',
    [companyId],
  )

  const recentResult = await query(
    `SELECT * FROM offers WHERE company_id = $1 ORDER BY created_at DESC LIMIT 5`,
    [companyId],
  )

  const recentOffers = await Promise.all(
    recentResult.rows.map(async (row) => {
      const appCount = await query(
        'SELECT COUNT(*)::int AS cnt FROM applications WHERE offer_id = $1',
        [row.id],
      )
      return {
        id: row.id,
        title: row.title,
        status: row.status,
        applicants: appCount.rows[0].cnt,
      }
    }),
  )

  const suggestedResult = await query(
    `SELECT p.id, p.user_id, p.bio, p.title, p.city, p.skills
     FROM profiles p
     ORDER BY p.completion_score DESC
     LIMIT 3`,
  )

  const suggestedTalents = await Promise.all(
    suggestedResult.rows.map(async (row) => {
      const userResult = await query(
        'SELECT id, email, name, first_name, last_name, avatar FROM users WHERE id = $1',
        [row.user_id],
      )
      const user = userResult.rows[0] || null
      return {
        id: row.id,
        userId: row.user_id,
        bio: row.bio || '',
        title: row.title || '',
        city: row.city || '',
        skills: row.skills || [],
        user,
      }
    }),
  )

  return {
    totalApplications: totalApps,
    newApplications: newApps,
    inInterview,
    activeOffers: activeResult.rows[0].cnt,
    views: viewsResult.rows[0].total,
    recentOffers,
    suggestedTalents,
  }
}

module.exports = {
  createApplication,
  listMyApplications,
  getApplication,
  updateApplicationStatus,
  listOfferApplications,
  getRecruiterDashboard,
}
