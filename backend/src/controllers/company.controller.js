const companyService = require('../services/company.service')

async function submitVerification(req, res, next) {
  try {
    const result = await companyService.submitVerification(req.user.id, req.body)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

async function getCompanyStatus(req, res, next) {
  try {
    const result = await companyService.getCompanyStatus(req.user.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function updateCompany(req, res, next) {
  try {
    const result = await companyService.updateCompany(req.user.id, req.body)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

module.exports = { submitVerification, getCompanyStatus, updateCompany }
