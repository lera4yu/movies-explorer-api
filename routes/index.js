const router = require('express').Router();
const userRouter = require('./users');
const movieRouter = require('./movies');
const auth = require('../middlewares/auth');
const { login, createUser } = require('../controllers/users');
const { validateSignUp, validateSignIn } = require('../middlewares/validation');
const { NotFoundError } = require('../errors/NotFoundError');
const { notFoundMessage } = require('../utils/messages');

router.post('/signup', validateSignUp, createUser);
router.post('/signin', validateSignIn, login);

router.use(auth);

router.use('/users', userRouter);
router.use('/movies', movieRouter);

router.use((req, res, next) => next(new NotFoundError(notFoundMessage)));

module.exports = router;
