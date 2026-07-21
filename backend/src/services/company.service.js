const { z } = require('zod')
const { query, pool } = require('../config/db')

const submitVerificationSchema = z.object({
  name: z.string().min(1, 'Nom requis.').max(200),
  sector: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  document_url: z.string().max(2000).optional(),
})

const updateCompanySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  sector: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  document_url: z.string().max(2000).optional(),
})

async function submitVerification(userId, input) {
  const data = submitVerificationSchema.parse(input)

  const existing = await query('SELECT id, status FROM companies WHERE user_id = $1', [userId])

  let company
  if (existing.rows.length) {
    const row = existing.rows[0]
    if (row.status === 'verified') {
      const err = new Error('Votre entreprise est déjà vérifiée.')
      err.status = 400
      throw err
    }
    const result = await query(
      `UPDATE companies
       SET name = $1, sector = $2, city = $3, description = $4,
           verification_doc_url = COALESCE($5, verification_doc_url),
           status = 'pending', updated_at = NOW()
       WHERE user_id = $6
       RETURNING *`,
      [data.name, data.sector || null, data.city || null, data.description || null, data.document_url || null, userId],
    )
    company = result.rows[0]
  } else {
    const result = await query(
      `INSERT INTO companies (user_id, name, sector, city, description, verification_doc_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [userId, data.name, data.sector || null, data.city || null, data.description || null, data.document_url || null],
    )
    company = result.rows[0]
  }

  return {
    status: company.status,
    company: {
      id: company.id,
      userId: company.user_id,
      name: company.name,
      sector: company.sector || '',
      city: company.city || '',
      description: company.description || '',
      documentUrl: company.verification_doc_url || '',
      status: company.status,
      submittedAt: company.created_at,
    },
  }
}

async function getCompanyStatus(userId) {
  const result = await query('SELECT * FROM companies WHERE user_id = $1', [userId])

  if (!result.rows.length) {
    return { status: null, company: null }
  }

  const c = result.rows[0]
  return {
    status: c.status,
    company: {
      id: c.id,
      userId: c.user_id,
      name: c.name,
      sector: c.sector || '',
      city: c.city || '',
      description: c.description || '',
      documentUrl: c.verification_doc_url || '',
      status: c.status,
      submittedAt: c.created_at,
    },
  }
}

async function updateCompany(userId, input) {
  const data = updateCompanySchema.parse(input)

  const existing = await query('SELECT id FROM companies WHERE user_id = $1', [userId])
  if (!existing.rows.length) {
    const err = new Error('Aucune entreprise trouvée. Créez d\'abord votre entreprise via l\'onboarding.')
    err.status = 404
    throw err
  }

  const fields = []
  const values = []
  let idx = 1

  if (data.name !== undefined) { fields.push(`name = $${idx}`); values.push(data.name); idx++ }
  if (data.sector !== undefined) { fields.push(`sector = $${idx}`); values.push(data.sector); idx++ }
  if (data.city !== undefined) { fields.push(`city = $${idx}`); values.push(data.city); idx++ }
  if (data.description !== undefined) { fields.push(`description = $${idx}`); values.push(data.description); idx++ }
  if (data.document_url !== undefined) { fields.push(`verification_doc_url = $${idx}`); values.push(data.document_url); idx++ }

  if (fields.length === 0) {
    return getCompanyStatus(userId)
  }

  fields.push('updated_at = NOW()')
  values.push(userId)

  await query(`UPDATE companies SET ${fields.join(', ')} WHERE user_id = $${idx}`, values)

  return getCompanyStatus(userId)
}

module.exports = { submitVerification, getCompanyStatus, updateCompany }
