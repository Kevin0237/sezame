const { Router } = require('express')
const { auth } = require('../middleware/auth')
const { roleGuard } = require('../middleware/roleGuard')
const companyController = require('../controllers/company.controller')

const router = Router()

router.post('/verify', auth, roleGuard('recruiter'), companyController.submitVerification)
router.get('/status', auth, roleGuard('recruiter'), companyController.getCompanyStatus)
router.put('/', auth, roleGuard('recruiter'), companyController.updateCompany)

module.exports = router
