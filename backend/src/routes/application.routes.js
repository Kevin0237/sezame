const { Router } = require('express')
const { auth } = require('../middleware/auth')
const { roleGuard } = require('../middleware/roleGuard')
const applicationController = require('../controllers/application.controller')

const router = Router()

router.get('/me', auth, roleGuard('student'), applicationController.listMyApplications)
router.get('/offer/:offerId', auth, roleGuard('recruiter'), applicationController.listOfferApplications)
router.get('/:id', auth, applicationController.getApplication)
router.post('/', auth, roleGuard('student'), applicationController.createApplication)
router.put('/:id/status', auth, roleGuard('recruiter'), applicationController.updateApplicationStatus)

module.exports = router
