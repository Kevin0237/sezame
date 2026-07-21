const authService = require('../services/auth.service')

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function logout(req, res, next) {
  try {
    const result = await authService.logout({ refreshToken: req.body.refreshToken })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function refresh(req, res, next) {
  try {
    const result = await authService.refresh(req.body)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function verifyEmail(req, res, next) {
  try {
    const token = req.body.token || req.query.token
    const result = await authService.verifyEmail({ token })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function resendVerification(req, res, next) {
  try {
    const result = await authService.resendVerificationEmail(req.body)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, logout, refresh, verifyEmail, resendVerification }
