const offerService = require('../services/offer.service')

async function listOffers(req, res, next) {
  try {
    const result = await offerService.listOffers(req.query)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function getOffer(req, res, next) {
  try {
    const result = await offerService.getOffer(req.params.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function createOffer(req, res, next) {
  try {
    const result = await offerService.createOffer(req.user.id, req.body)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

async function updateOffer(req, res, next) {
  try {
    const result = await offerService.updateOffer(req.user.id, req.params.id, req.body)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function closeOffer(req, res, next) {
  try {
    const result = await offerService.closeOffer(req.user.id, req.params.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function listCompanyOffers(req, res, next) {
  try {
    const result = await offerService.listCompanyOffers(req.user.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

module.exports = { listOffers, getOffer, createOffer, updateOffer, closeOffer, listCompanyOffers }
