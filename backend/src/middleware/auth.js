const jwt = require('jsonwebtoken')
const { env } = require('../config/env')
const { query } = require('../config/db')

/**
 * JWT authentication middleware.
 * Verifies the Bearer token and attaches req.user = { id, email, role }.
 */
async function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou invalide.' })
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, env.jwtSecret)

    const result = await query(
      'SELECT id, email, first_name, last_name, name, avatar, role, email_verified FROM users WHERE id = $1 AND is_active = TRUE',
      [payload.sub],
    )

    if (!result.rows.length) {
      return res.status(401).json({ message: 'Compte introuvable ou désactivé.' })
    }

    const row = result.rows[0]
    req.user = {
      id: row.id,
      email: row.email,
      firstName: row.first_name || '',
      lastName: row.last_name || '',
      name: row.name || '',
      avatar: row.avatar || null,
      role: row.role,
      emailVerified: row.email_verified,
    }

    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré. Veuillez vous reconnecter.' })
    }
    return res.status(401).json({ message: 'Token invalide.' })
  }
}

module.exports = { auth }
