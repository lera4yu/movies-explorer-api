const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { getSecret } = require('../utils/config');
const NotFoundError = require('../errors/NotFoundError');
const InputError = require('../errors/InputError');
const AuthorizationError = require('../errors/AuthorizationError');
const DuplicateError = require('../errors/DuplicateError');
const {
  authorizationMessage,
  inputMessageData,
  inputMessageUser,
  duplicateMessage,
  notFoundMessageUser,
} = require('../utils/messages');

module.exports.createUser = (req, res, next) => {
  const {
    email,
    password,
    name,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then((user) => {
      const { _id } = user;
      res.status(201).send({
        email,
        name,
        _id,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new DuplicateError(duplicateMessage));
      } else if (err.name === 'ValidationError') {
        next(new InputError(inputMessageData));
      } else {
        next(err);
      }
    });
};

module.exports.updateUser = (req, res, next) => {
  const { email, name } = req.body;
  User.findByIdAndUpdate(req.user._id, { email, name }, { new: true, runValidators: true })
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        next(new NotFoundError(notFoundMessageUser));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new InputError(inputMessageData));
      } else if (err.name === 'CastError') {
        next(new InputError(inputMessageUser));
      } else if (err.code === 11000) {
        next(new DuplicateError(duplicateMessage));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      if (user) {
        console.log('ya tut', getSecret());
        const token = jwt.sign({ _id: user._id }, getSecret(), { expiresIn: '7d' });
        res.send({ token });
      } else {
        throw new AuthorizationError(authorizationMessage);
      }
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  const { _id } = req.user;
  User.find({ _id })
    .then((user) => {
      if (!user) {
        throw new NotFoundError(notFoundMessageUser);
      }
      res.send({ data: { email: user[0].email, name: user[0].name } });
    })
    .catch(next);
};
