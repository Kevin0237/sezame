const { z } = require('zod')
const { query, pool } = require('../config/db')

const createOfferSchema = z.object({
  title: z.string().min(1, 'Titre requis.').max(200),
  description: z.string().min(1, 'Description requise.').max(5000),
  type: z.enum(['employment', 'freelance']),
  contractType: z.string().max(50).optional(),
  city: z.string().min(1, 'Ville requise.').max(100),
  workMode: z.string().max(50).optional(),
  sector: z.string().max(100).optional(),
  minSalary: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  maxSalary: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  deadline: z.string().min(1, 'Date limite requise.'),
})

const updateOfferSchema = createOfferSchema.partial()

function mapOffer(row, company, applicants) {
  return {
    id: row.id,
    companyId: row.company_id,
    title: row.title,
    description: row.description || '',
    type: row.type,
    contractType: row.contract_type || '',
    city: row.city,
    workMode: row.work_mode || '',
    sector: row.sector || '',
    minSalary: row.min_salary,
    maxSalary: row.max_salary,
    deadline: row.deadline,
    status: row.status,
    createdAt: row.created_at,
    views: row.views || 0,
    company: company || null,
    applicants: applicants ?? undefined,
  }
}

async function listOffers({ q, city, type, contractType, sector, page = 1 } = {}) {
  const limit = 10
  const offset = (Math.max(1, Number(page)) - 1) * limit

  const conditions = ["o.status = 'active'"]
  const values = []
  let idx = 1

  if (q) {
    conditions.push(`o.title ILIKE $${idx}`)
    values.push(`%${q}%`)
    idx++
  }
  if (city) {
    conditions.push(`o.city ILIKE $${idx}`)
    values.push(`%${city}%`)
    idx++
  }
  if (type) {
    conditions.push(`o.type = $${idx}`)
    values.push(type)
    idx++
  }
  if (contractType) {
    conditions.push(`o.contract_type = $${idx}`)
    values.push(contractType)
    idx++
  }
  if (sector) {
    conditions.push(`o.sector ILIKE $${idx}`)
    values.push(`%${sector}%`)
    idx++
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM offers o ${where}`,
    values,
  )
  const total = countResult.rows[0].total

  values.push(limit, offset)
  const dataResult = await query(
    `SELECT o.* FROM offers o ${where} ORDER BY o.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
    values,
  )

  const offers = await Promise.all(
    dataResult.rows.map(async (row) => {
      const companyResult = await query(
        'SELECT id, name, city FROM companies WHERE id = $1',
        [row.company_id],
      )
      return mapOffer(row, companyResult.rows[0] || null)
    }),
  )

  return { offers, total }
}

async function getOffer(id) {
  const result = await query('SELECT * FROM offers WHERE id = $1', [id])
  if (!result.rows.length) {
    const err = new Error('Offre introuvable.')
    err.status = 404
    throw err
  }

  const row = result.rows[0]
  const companyResult = await query(
    'SELECT id, name, city FROM companies WHERE id = $1',
    [row.company_id],
  )

  return mapOffer(row, companyResult.rows[0] || null)
}

async function createOffer(userId, input) {
  const data = createOfferSchema.parse(input)

  const companyResult = await query(
    'SELECT id, status FROM companies WHERE user_id = $1',
    [userId],
  )

  if (!companyResult.rows.length) {
    const err = new Error('Aucune entreprise associée à ce compte.')
    err.status = 400
    throw err
  }

  if (companyResult.rows[0].status !== 'verified') {
    const err = new Error('Votre entreprise doit être vérifiée avant de publier une offre.')
    err.status = 403
    throw err
  }

  const companyId = companyResult.rows[0].id

  const result = await query(
    `INSERT INTO offers (company_id, title, description, type, contract_type, city, work_mode, sector, min_salary, max_salary, deadline)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      companyId,
      data.title,
      data.description,
      data.type,
      data.contractType || null,
      data.city,
      data.workMode || null,
      data.sector || null,
      data.minSalary,
      data.maxSalary,
      data.deadline,
    ],
  )

  const companyInfo = await query('SELECT id, name, city FROM companies WHERE id = $1', [companyId])
  return mapOffer(result.rows[0], companyInfo.rows[0] || null, 0)
}

async function updateOffer(userId, offerId, input) {
  const data = updateOfferSchema.parse(input)

  const offerResult = await query('SELECT * FROM offers WHERE id = $1', [offerId])
  if (!offerResult.rows.length) {
    const err = new Error('Offre introuvable.')
    err.status = 404
    throw err
  }

  const companyResult = await query(
    'SELECT id FROM companies WHERE user_id = $1',
    [userId],
  )
  if (!companyResult.rows.length || companyResult.rows[0].id !== offerResult.rows[0].company_id) {
    const err = new Error('Non autorisé.')
    err.status = 403
    throw err
  }

  const fields = []
  const values = []
  let idx = 1

  const columnMap = {
    title: 'title',
    description: 'description',
    type: 'type',
    contractType: 'contract_type',
    city: 'city',
    workMode: 'work_mode',
    sector: 'sector',
    minSalary: 'min_salary',
    maxSalary: 'max_salary',
    deadline: 'deadline',
  }

  for (const [key, col] of Object.entries(columnMap)) {
    if (data[key] !== undefined) {
      fields.push(`${col} = $${idx}`)
      values.push(data[key])
      idx++
    }
  }

  if (fields.length === 0) return getOffer(offerId)

  fields.push('updated_at = NOW()')
  values.push(offerId)

  await query(`UPDATE offers SET ${fields.join(', ')} WHERE id = $${idx}`, values)

  return getOffer(offerId)
}

async function closeOffer(userId, offerId) {
  const offerResult = await query('SELECT * FROM offers WHERE id = $1', [offerId])
  if (!offerResult.rows.length) {
    const err = new Error('Offre introuvable.')
    err.status = 404
    throw err
  }

  const companyResult = await query(
    'SELECT id FROM companies WHERE user_id = $1',
    [userId],
  )
  if (!companyResult.rows.length || companyResult.rows[0].id !== offerResult.rows[0].company_id) {
    const err = new Error('Non autorisé.')
    err.status = 403
    throw err
  }

  await query("UPDATE offers SET status = 'closed', updated_at = NOW() WHERE id = $1", [offerId])
  return { message: 'Offre fermée.' }
}

async function listCompanyOffers(userId) {
  const companyResult = await query(
    'SELECT id, name, city FROM companies WHERE user_id = $1',
    [userId],
  )

  if (!companyResult.rows.length) {
    return []
  }

  const companyId = companyResult.rows[0].id
  const company = companyResult.rows[0]

  const offersResult = await query(
    'SELECT * FROM offers WHERE company_id = $1 ORDER BY created_at DESC',
    [companyId],
  )

  const offers = await Promise.all(
    offersResult.rows.map(async (row) => {
      const appCount = await query(
        'SELECT COUNT(*)::int AS cnt FROM applications WHERE offer_id = $1',
        [row.id],
      )
      return mapOffer(row, company, appCount.rows[0].cnt)
    }),
  )

  return offers
}

module.exports = { listOffers, getOffer, createOffer, updateOffer, closeOffer, listCompanyOffers }
