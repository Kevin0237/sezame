const applicationService = require('../services/application.service')

async function createApplication(req, res, next) {
  try {
    const result = await applicationService.createApplication(req.user.id, req.body.offer_id)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

async function listMyApplications(req, res, next) {
  try {
    const result = await applicationService.listMyApplications(req.user.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function getApplication(req, res, next) {
  try {
    const result = await applicationService.getApplication(req.user.id, req.params.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function updateApplicationStatus(req, res, next) {
  try {
    const result = await applicationService.updateApplicationStatus(
      req.user.id,
      req.params.id,
      req.body.status,
    )
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function listOfferApplications(req, res, next) {
  try {
    const result = await applicationService.listOfferApplications(req.user.id, req.params.offerId)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function getRecruiterDashboard(req, res, next) {
  try {
    const result = await applicationService.getRecruiterDashboard(req.user.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  createApplication,
  listMyApplications,
  getApplication,
  updateApplicationStatus,
  listOfferApplications,
  getRecruiterDashboard,
}
