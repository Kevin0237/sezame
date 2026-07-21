const { ZodError } = require('zod')

function notFoundHandler(_req, res) {
  res.status(404).json({ message: 'Route introuvable.' })
}

function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    const message = err.errors[0]?.message || 'Données invalides.'
    return res.status(400).json({ message })
  }

  const status = err.status || 500
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Une erreur interne est survenue.'
      : err.message || 'Une erreur est survenue.'

  if (status === 500) {
    console.error(err)
  }

  res.status(status).json({ message })
}

module.exports = { notFoundHandler, errorHandler }
