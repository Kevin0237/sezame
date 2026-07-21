const profileService = require('../services/profile.service')

async function uploadImage(req, res, next) {
  try {
    if (!req.uploadedUrl) {
      const err = new Error('Aucun fichier uploadé.')
      err.status = 400
      throw err
    }
    res.json({ url: req.uploadedUrl })
  } catch (err) {
    next(err)
  }
}

module.exports = { uploadImage }
