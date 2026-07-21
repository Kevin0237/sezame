const { Router } = require('express')
const { auth } = require('../middleware/auth')
const notificationController = require('../controllers/notification.controller')

const router = Router()

router.use(auth)
router.get('/', notificationController.listNotifications)
router.get('/unread-count', notificationController.getUnreadCount)
router.put('/read-all', notificationController.markAllAsRead)
router.put('/:id/read', notificationController.markAsRead)

module.exports = router
