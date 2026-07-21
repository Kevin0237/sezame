const { Router } = require('express')
const { auth } = require('../middleware/auth')
const { roleGuard } = require('../middleware/roleGuard')
const adminController = require('../controllers/admin.controller')

const router = Router()

router.use(auth)
router.use(roleGuard('admin'))

router.get('/dashboard', adminController.getDashboard)
router.get('/verifications', adminController.listVerifications)
router.put('/verifications/:userId', adminController.resolveVerification)
router.get('/reports', adminController.listReports)
router.put('/offers/:id/disable', adminController.disableOffer)
router.get('/accounts', adminController.listAccounts)
router.put('/accounts/:userId/disabled', adminController.setAccountDisabled)

module.exports = router
