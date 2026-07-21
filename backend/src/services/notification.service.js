const { query, pool } = require('../config/db')
const { parsePagination, paginatedResponse } = require('../db/helpers')

async function createNotification(userId, { type, content, link = null }) {
  const result = await query(
    `INSERT INTO notifications (user_id, type, content, link)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, type, content, is_read, link, created_at`,
    [userId, type, content, link],
  )
  return result.rows[0]
}

async function listNotifications(userId, params = {}) {
  const { limit, offset, page } = parsePagination(params)

  const countResult = await query(
    'SELECT COUNT(*)::int AS total FROM notifications WHERE user_id = $1',
    [userId],
  )
  const total = countResult.rows[0].total

  const result = await query(
    `SELECT id, user_id, type, content, is_read, link, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  )

  return paginatedResponse({ rows: result.rows, total, page, limit })
}

async function markAsRead(userId, notificationId) {
  const result = await query(
    `UPDATE notifications SET is_read = TRUE
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, type, content, is_read, link, created_at`,
    [notificationId, userId],
  )
  if (!result.rows.length) {
    const err = new Error('Notification introuvable.')
    err.status = 404
    throw err
  }
  return result.rows[0]
}

async function markAllAsRead(userId) {
  await query(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
    [userId],
  )
}

async function getUnreadCount(userId) {
  const result = await query(
    'SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
    [userId],
  )
  return result.rows[0].count
}

module.exports = {
  createNotification,
  listNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
}
