const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { getSecret } = require('../utils/secrets');
const NotFoundError = require('../errors/NotFoundError');
const InputError = require('../errors/InputError');
const AuthorizationError = require('../errors/AuthorizationError');
const DuplicateError = require('../errors/DuplicateError');

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
        next(new DuplicateError('Пользователь с таким адресом электронной почты уже существует'));
      } else if (err.name === 'ValidationError') {
        next(new InputError('Данные введены некорректно'));
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
        next(new NotFoundError('Пользователь с таким id не найден'));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new InputError('Данные введены некорректно'));
      } else if (err.name === 'CastError') {
        next(new InputError('Формат ID пользователя не корректен'));
      } else if (err.code === 11000) {
        next(new DuplicateError('Пользователь с таким адресом электронной почты уже существует'));
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
        const token = jwt.sign({ _id: user._id }, getSecret(), { expiresIn: '7d' });
        res.send({ token });
      } else {
        throw new AuthorizationError('Неправильные почта или пароль');
      }
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  const { _id } = req.user;
  User.find({ _id })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      res.send({ data: { email: user[0].email, name: user[0].name } });
    })
    .catch(next);
};
