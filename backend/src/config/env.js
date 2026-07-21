require('dotenv').config()

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  brevoApiKey: process.env.BREVO_API_KEY,
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@sezame.cm',
  brevoSenderName: process.env.BREVO_SENDER_NAME || 'Sezame',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
}

function validateEnv() {
  const missing = []
  if (!env.databaseUrl) missing.push('DATABASE_URL')
  if (!env.jwtSecret) missing.push('JWT_SECRET')

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  if (env.jwtSecret === 'change_this_secret' && env.nodeEnv === 'production') {
    throw new Error('JWT_SECRET must be changed before running in production.')
  }
}

validateEnv()

module.exports = { env }
