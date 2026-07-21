const jwt = require('jsonwebtoken')
const { z } = require('zod')
const { pool, query } = require('../config/db')
const { hashPassword, comparePassword } = require('../utils/password')
const { generateToken } = require('../utils/tokens')
const { sendVerificationEmail } = require('./email.service')
const { env } = require('../config/env')

const ACCESS_TOKEN_EXPIRY = '1h'
const REFRESH_TOKEN_EXPIRY_DAYS = 7

const registerSchema = z.object({
  email: z.string().email('Adresse e-mail invalide.'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
    .max(128),
  role: z.enum(['student', 'recruiter'], {
    errorMap: () => ({ message: 'Le rôle doit être student ou recruiter.' }),
  }),
})

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token de vérification requis.'),
})

const resendSchema = z.object({
  email: z.string().email('Adresse e-mail invalide.'),
})

const loginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide.'),
  password: z.string().min(1, 'Mot de passe requis.'),
})

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    name: row.name || '',
    avatar: row.avatar || null,
    role: row.role,
    emailVerified: row.email_verified,
  }
}

function createAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  })
}

async function createRefreshToken(executeQuery, userId) {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

  await executeQuery(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt],
  )

  return token
}

async function saveVerificationToken(executeQuery, userId) {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await executeQuery('DELETE FROM email_verification_tokens WHERE user_id = $1', [userId])
  await executeQuery(
    `INSERT INTO email_verification_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt],
  )

  return token
}

async function register(input) {
  const data = registerSchema.parse(input)
  const email = data.email.toLowerCase().trim()

  const existing = await query('SELECT id FROM users WHERE email = $1', [email])
  if (existing.rows.length) {
    const err = new Error('Un compte existe déjà avec cet e-mail.')
    err.status = 409
    throw err
  }

  const passwordHash = await hashPassword(data.password)
  const recruiterStatus = data.role === 'recruiter' ? 'pending' : null
  const isDev = env.nodeEnv === 'development'

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, role, email_verified, recruiter_status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, name, avatar, role, email_verified`,
      [email, passwordHash, data.role, isDev, recruiterStatus],
    )
    const user = userResult.rows[0]

    if (data.role === 'student') {
      await client.query(`INSERT INTO profiles (user_id, completion_score) VALUES ($1, 10)`, [
        user.id,
      ])
    }

    const token = await saveVerificationToken(client.query.bind(client), user.id)
    await client.query('COMMIT')

    if (!isDev) {
      await sendVerificationEmail({ to: email, token }).catch((err) => {
        console.error('[register] Email send failed (non-blocking):', err.message)
      })
    }

    return {
      ...publicUser(user),
      message: isDev
        ? 'Compte créé. E-mail automatiquement vérifié en mode développement.'
        : 'Compte créé. Vérifiez votre e-mail pour activer l\'accès complet à la plateforme.',
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

async function login(input) {
  const data = loginSchema.parse(input)
  const email = data.email.toLowerCase().trim()

  const result = await query(
    'SELECT id, email, first_name, last_name, name, avatar, password_hash, role, email_verified, is_active FROM users WHERE email = $1',
    [email],
  )

  if (!result.rows.length) {
    const err = new Error('E-mail ou mot de passe incorrect.')
    err.status = 401
    throw err
  }

  const user = result.rows[0]

  if (!user.is_active) {
    const err = new Error('Ce compte a été désactivé.')
    err.status = 403
    throw err
  }

  if (!user.email_verified) {
    const err = new Error('Vérifiez votre adresse e-mail avant de vous connecter.')
    err.status = 403
    throw err
  }

  const valid = await comparePassword(data.password, user.password_hash)
  if (!valid) {
    const err = new Error('E-mail ou mot de passe incorrect.')
    err.status = 401
    throw err
  }

  const accessToken = createAccessToken(user)
  const refreshToken = await createRefreshToken(query, user.id)

  return {
    token: accessToken,
    refreshToken,
    user: publicUser(user),
  }
}

async function refresh(input) {
  const schema = z.object({ refreshToken: z.string().min(1) })
  const { refreshToken } = schema.parse(input)

  const result = await query(
    `SELECT rt.user_id, rt.expires_at, u.id, u.email, u.role, u.email_verified, u.is_active
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token = $1`,
    [refreshToken],
  )

  if (!result.rows.length) {
    const err = new Error('Refresh token invalide.')
    err.status = 401
    throw err
  }

  const row = result.rows[0]

  if (new Date(row.expires_at) < new Date()) {
    await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken])
    const err = new Error('Refresh token expiré. Veuillez vous reconnecter.')
    err.status = 401
    throw err
  }

  if (!row.is_active) {
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [row.user_id])
    const err = new Error('Ce compte a été désactivé.')
    err.status = 403
    throw err
  }

  // Rotate: delete old refresh token, issue new pair
  await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken])

  const newAccessToken = createAccessToken({ id: row.id, role: row.role })
  const newRefreshToken = await createRefreshToken(query, row.user_id)

  return {
    token: newAccessToken,
    refreshToken: newRefreshToken,
  }
}

async function logout(input) {
  const schema = z.object({ refreshToken: z.string().optional() })
  const { refreshToken } = schema.parse(input)

  if (refreshToken) {
    await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken])
  }

  return { message: 'Déconnexion réussie.' }
}

async function verifyEmail(input) {
  const { token } = verifyEmailSchema.parse(input)

  const tokenResult = await query(
    `SELECT evt.user_id, evt.expires_at, u.email, u.role, u.email_verified
     FROM email_verification_tokens evt
     JOIN users u ON u.id = evt.user_id
     WHERE evt.token = $1`,
    [token],
  )

  if (!tokenResult.rows.length) {
    const err = new Error('Lien de vérification invalide ou déjà utilisé.')
    err.status = 400
    throw err
  }

  const row = tokenResult.rows[0]
  if (row.email_verified) {
    return {
      message: 'E-mail déjà vérifié.',
      user: { email: row.email, role: row.role, emailVerified: true },
    }
  }

  if (new Date(row.expires_at) < new Date()) {
    const err = new Error('Ce lien de vérification a expiré. Demandez un nouvel e-mail.')
    err.status = 400
    throw err
  }

  await query('UPDATE users SET email_verified = TRUE, updated_at = NOW() WHERE id = $1', [
    row.user_id,
  ])
  await query('DELETE FROM email_verification_tokens WHERE user_id = $1', [row.user_id])

  return {
    message: 'E-mail vérifié avec succès. Vous pouvez vous connecter.',
    user: { email: row.email, role: row.role, emailVerified: true },
  }
}

async function resendVerificationEmail(input) {
  const { email } = resendSchema.parse(input)
  const normalized = email.toLowerCase().trim()

  const userResult = await query(
    'SELECT id, email, role, email_verified FROM users WHERE email = $1',
    [normalized],
  )

  if (!userResult.rows.length) {
    return {
      message: 'Si un compte existe pour cette adresse, un e-mail de vérification a été envoyé.',
    }
  }

  const user = userResult.rows[0]
  if (user.email_verified) {
    return { message: 'Cet e-mail est déjà vérifié.' }
  }

  const token = await saveVerificationToken(query, user.id)
  await sendVerificationEmail({ to: normalized, token })

  return {
    message: 'Si un compte existe pour cette adresse, un e-mail de vérification a été envoyé.',
  }
}

module.exports = {
  register,
  login,
  logout,
  refresh,
  verifyEmail,
  resendVerificationEmail,
  registerSchema,
}
