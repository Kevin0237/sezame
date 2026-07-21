require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })

const { pool } = require('../src/config/db')
const { hashPassword } = require('../src/utils/password')
const { generateToken } = require('../src/utils/tokens')

const DEMO_PASSWORD = 'secret123'

const users = [
  { email: 'aicha@email.com', role: 'student', emailVerified: true },
  { email: 'amadou@email.com', role: 'student', emailVerified: true },
  { email: 'recruteur@globaltech.cm', role: 'recruiter', emailVerified: true, recruiterStatus: 'verified' },
  { email: 'pending@startup.cm', role: 'recruiter', emailVerified: true, recruiterStatus: 'pending' },
  { email: 'admin@sezame.cm', role: 'admin', emailVerified: true },
]

const companies = [
  { ownerEmail: 'recruteur@globaltech.cm', name: 'Global Tech Cameroon', sector: 'Technologie', city: 'Douala', status: 'verified' },
  { ownerEmail: 'pending@startup.cm', name: 'Kamsol Solutions', sector: 'E-commerce', city: 'Yaoundé', status: 'pending' },
]

const offers = [
  { companyOwner: 'recruteur@globaltech.cm', title: 'Développeur React Senior', description: 'Rejoignez notre équipe frontend pour des projets innovants.', type: 'employment', city: 'Douala', minSalary: 600000, maxSalary: 900000, sector: 'Technologie', deadline: '2026-12-31' },
  { companyOwner: 'recruteur@globaltech.cm', title: 'Designer UX/UI', description: 'Créez des expériences utilisateur magnifiques.', type: 'employment', city: 'Douala', minSalary: 400000, maxSalary: 700000, sector: 'Design', deadline: '2026-11-30' },
  { companyOwner: 'recruteur@globaltech.cm', title: 'Data Analyst Freelance', description: 'Analysez nos données marketing pendant 3 mois.', type: 'freelance', city: 'Remote', minSalary: 300000, maxSalary: 500000, sector: 'Marketing', deadline: '2026-10-15' },
]

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Clean existing data
    await client.query(`
      DELETE FROM application_status_history;
      DELETE FROM applications;
      DELETE FROM reports;
      DELETE FROM notifications;
      DELETE FROM offers;
      DELETE FROM achievements;
      DELETE FROM profiles;
      DELETE FROM companies;
      DELETE FROM email_verification_tokens;
      DELETE FROM users;
    `)

    const passwordHash = await hashPassword(DEMO_PASSWORD)
    const userIds = {}

    // Insert users
    for (const u of users) {
      const res = await client.query(
        `INSERT INTO users (email, password_hash, role, email_verified, recruiter_status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [u.email, passwordHash, u.role, u.emailVerified, u.recruiterStatus || null],
      )
      userIds[u.email] = res.rows[0].id
    }

    // Create empty profiles for students
    for (const u of users.filter((u) => u.role === 'student')) {
      await client.query(
        'INSERT INTO profiles (user_id, completion_score) VALUES ($1, 10)',
        [userIds[u.email]],
      )
    }

    // Create companies
    const companyIds = {}
    for (const c of companies) {
      const res = await client.query(
        `INSERT INTO companies (user_id, name, sector, city, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [userIds[c.ownerEmail], c.name, c.sector, c.city, c.status],
      )
      companyIds[c.ownerEmail] = res.rows[0].id
    }

    // Create offers
    for (const o of offers) {
      await client.query(
        `INSERT INTO offers (company_id, title, description, type, city, min_salary, max_salary, sector, deadline)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [companyIds[o.companyOwner], o.title, o.description, o.type, o.city, o.minSalary, o.maxSalary, o.sector, o.deadline],
      )
    }

    await client.query('COMMIT')
    console.log(`Seeded: ${users.length} users, ${companies.length} companies, ${offers.length} offers`)
    console.log(`Demo password: ${DEMO_PASSWORD}`)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Seed failed:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
