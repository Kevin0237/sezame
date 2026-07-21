const { Router } = require('express')
const { auth } = require('../middleware/auth')
const { roleGuard } = require('../middleware/roleGuard')
const applicationController = require('../controllers/application.controller')

const router = Router()

router.get('/recruiter', auth, roleGuard('recruiter'), applicationController.getRecruiterDashboard)

module.exports = router
