const adminService = require('../services/admin.service')

async function listVerifications(req, res, next) {
  try {
    const result = await adminService.listVerifications()
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function resolveVerification(req, res, next) {
  try {
    const { action } = req.body
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Action invalide.' })
    }
    const result = await adminService.resolveVerification(req.params.userId, action)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function listReports(req, res, next) {
  try {
    const result = await adminService.listReports()
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function disableOffer(req, res, next) {
  try {
    const result = await adminService.disableOffer(req.params.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function listAccounts(req, res, next) {
  try {
    const result = await adminService.listAccounts(req.query)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function setAccountDisabled(req, res, next) {
  try {
    const { disabled } = req.body
    const result = await adminService.setAccountDisabled(req.params.userId, !!disabled)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function getDashboard(req, res, next) {
  try {
    const result = await adminService.getDashboard()
    res.json(result)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listVerifications,
  resolveVerification,
  listReports,
  disableOffer,
  listAccounts,
  setAccountDisabled,
  getDashboard,
}
