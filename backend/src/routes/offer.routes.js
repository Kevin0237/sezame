const { Router } = require('express')
const { auth } = require('../middleware/auth')
const { roleGuard } = require('../middleware/roleGuard')
const offerController = require('../controllers/offer.controller')

const router = Router()

router.get('/', offerController.listOffers)
router.get('/recruiter', auth, roleGuard('recruiter'), offerController.listCompanyOffers)
router.get('/:id', offerController.getOffer)
router.post('/', auth, roleGuard('recruiter'), offerController.createOffer)
router.put('/:id', auth, roleGuard('recruiter'), offerController.updateOffer)
router.delete('/:id', auth, roleGuard('recruiter'), offerController.closeOffer)

module.exports = router
