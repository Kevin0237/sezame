/**
 * Parse common pagination query params.
 * @param {object} query - req.query
 * @returns {{ limit: number, offset: number, page: number }}
 */
function parsePagination({ page = 1, limit = 20 } = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1)
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))
  return { limit: l, offset: (p - 1) * l, page: p }
}

/**
 * Build a paginated response object.
 * @param {object} opts
 * @param {Array}  opts.rows     - The data rows
 * @param {number} opts.total    - Total count (from COUNT query)
 * @param {number} opts.page     - Current page
 * @param {number} opts.limit    - Page size
 * @returns {{ data, pagination: { page, limit, total, totalPages } }}
 */
function paginatedResponse({ rows, total, page, limit }) {
  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

module.exports = { parsePagination, paginatedResponse }
