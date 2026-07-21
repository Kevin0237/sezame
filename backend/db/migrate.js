const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is missing in backend/.env')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('supabase.co')
      ? { rejectUnauthorized: false }
      : undefined,
  })

  const schemaPath = path.join(__dirname, '..', 'schema.sql')
  const sql = fs.readFileSync(schemaPath, 'utf8')

  try {
    await pool.query(sql)
    console.log('Schema applied successfully.')
  } catch (err) {
    console.error('Migration failed:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

migrate()
