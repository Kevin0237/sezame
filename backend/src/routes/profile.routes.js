const { Router } = require('express')
const { auth } = require('../middleware/auth')
const { roleGuard } = require('../middleware/roleGuard')
const profileController = require('../controllers/profile.controller')

const router = Router()

router.get('/me', auth, roleGuard('student'), profileController.getMe)
router.put('/me', auth, roleGuard('student'), profileController.updateMe)
router.post('/achievements', auth, roleGuard('student'), profileController.addAchievement)
router.delete('/achievements/:id', auth, roleGuard('student'), profileController.deleteAchievement)
router.get('/candidates/:userId', auth, roleGuard('recruiter'), profileController.getCandidate)

module.exports = router
