const jwt = require('jsonwebtoken');
const config = require('../config');
const userModel = require('../models/userModel');

function getTokenFromHeader(header = '') {
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

function authMiddleware(req, res, next) {
  const token = getTokenFromHeader(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: 'Authorization token missing' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = userModel.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = { id: user.id, email: user.email };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;
module.exports.getTokenFromHeader = getTokenFromHeader;
