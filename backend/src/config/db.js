const { Pool } = require('pg')
const { env } = require('./env')

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseUrl.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
})

pool.on('error', (err) => {
  console.error('Unexpected database error:', err.message)
})

module.exports = { pool, query: (text, params) => pool.query(text, params) }
