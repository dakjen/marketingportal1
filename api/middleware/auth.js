const authorizeRole = (allowedRoles) => (req, res, next) => {
  const userRole = req.headers['x-user-role'];

  let effectiveAllowedRoles = [...allowedRoles];
  if (allowedRoles.includes('admin')) {
    effectiveAllowedRoles.push('admin2');
  }

  if (!userRole || !effectiveAllowedRoles.includes(userRole)) {
    return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
  }
  next();
};

module.exports = { authorizeRole };
