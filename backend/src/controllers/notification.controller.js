const notificationService = require('../services/notification.service')

function mapNotification(row) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    content: row.content,
    isRead: row.is_read,
    link: row.link,
    createdAt: row.created_at,
  }
}

async function listNotifications(req, res, next) {
  try {
    const result = await notificationService.listNotifications(req.user.id, req.query)
    res.json(result.data.map(mapNotification))
  } catch (err) {
    next(err)
  }
}

async function markAsRead(req, res, next) {
  try {
    const result = await notificationService.markAsRead(req.user.id, req.params.id)
    res.json(mapNotification(result))
  } catch (err) {
    next(err)
  }
}

async function markAllAsRead(req, res, next) {
  try {
    await notificationService.markAllAsRead(req.user.id)
    res.json({ message: 'Toutes les notifications ont été marquées comme lues.' })
  } catch (err) {
    next(err)
  }
}

async function getUnreadCount(req, res, next) {
  try {
    const count = await notificationService.getUnreadCount(req.user.id)
    res.json({ count })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
}
