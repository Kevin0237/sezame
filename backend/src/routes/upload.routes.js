const { Router } = require('express')
const { auth } = require('../middleware/auth')
const { roleGuard } = require('../middleware/roleGuard')
const { upload, uploadToCloudinary } = require('../middleware/upload')
const uploadController = require('../controllers/upload.controller')

const router = Router()

router.post(
  '/',
  auth,
  roleGuard('student', 'recruiter'),
  upload.single('image'),
  uploadToCloudinary,
  uploadController.uploadImage,
)

module.exports = router
