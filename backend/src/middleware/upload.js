const multer = require('multer')
const { cloudinary } = require('../config/cloudinary')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Seules les images et les PDF sont acceptés.'))
  },
})

function uploadToCloudinary(req, _res, next) {
  if (!req.file) return next()

  const stream = cloudinary.uploader.upload_stream(
    {
      folder: 'sezame/achievements',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    },
    (error, result) => {
      if (error) return next(error)
      req.uploadedUrl = result.secure_url
      next()
    },
  )

  stream.end(req.file.buffer)
}

module.exports = { upload, uploadToCloudinary }
