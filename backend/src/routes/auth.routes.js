const { Router } = require('express')
const authController = require('../controllers/auth.controller')

const router = Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.post('/refresh', authController.refresh)
router.post('/verify-email', authController.verifyEmail)
router.get('/verify-email', authController.verifyEmail)
router.post('/resend-verification', authController.resendVerification)

module.exports = router
