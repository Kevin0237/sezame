const profileService = require('../services/profile.service')

async function getMe(req, res, next) {
  try {
    const result = await profileService.getMe(req.user.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function updateMe(req, res, next) {
  try {
    const result = await profileService.updateMe(req.user.id, req.body)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function addAchievement(req, res, next) {
  try {
    const result = await profileService.addAchievement(req.user.id, req.body)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

async function deleteAchievement(req, res, next) {
  try {
    const result = await profileService.deleteAchievement(req.user.id, req.params.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function getCandidate(req, res, next) {
  try {
    const result = await profileService.getCandidate(req.params.userId)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

module.exports = { getMe, updateMe, addAchievement, deleteAchievement, getCandidate }
