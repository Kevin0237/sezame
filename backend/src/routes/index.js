const { Router } = require('express')
const authRoutes = require('./auth.routes')
const profileRoutes = require('./profile.routes')
const uploadRoutes = require('./upload.routes')
const offerRoutes = require('./offer.routes')
const applicationRoutes = require('./application.routes')
const dashboardRoutes = require('./dashboard.routes')
const companyRoutes = require('./company.routes')
const notificationRoutes = require('./notification.routes')
const adminRoutes = require('./admin.routes')

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Sezame API is running' })
})

router.use('/auth', authRoutes)
router.use('/profile', profileRoutes)
router.use('/upload', uploadRoutes)
router.use('/offers', offerRoutes)
router.use('/applications', applicationRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/company', companyRoutes)
router.use('/notifications', notificationRoutes)
router.use('/admin', adminRoutes)

module.exports = router
