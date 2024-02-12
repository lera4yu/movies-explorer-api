const jwt = require('jsonwebtoken');
const AuthorizationError = require('../errors/AuthorizationError');
const { authorizationMessage } = require('../utils/messages');
const { getSecret } = require('../utils/config');

const extractBearerToken = function (header) {
  return header.replace('Bearer ', '');
};

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AuthorizationError(authorizationMessage);
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, getSecret());
  } catch (err) {
    next(new AuthorizationError(authorizationMessage));
  }

  req.user = payload;

  next();
};
