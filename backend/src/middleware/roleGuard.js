/**
 * Role-based access control middleware factory.
 * Must be used after the auth middleware.
 *
 * @param  {...string} roles - Allowed roles (e.g. 'student', 'recruiter', 'admin')
 * @returns Express middleware
 *
 * @example
 *   router.get('/student/dashboard', auth, roleGuard('student'), controller.dashboard)
 */
function roleGuard(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié.' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès interdit pour ce rôle.' })
    }
    next()
  }
}

module.exports = { roleGuard }
