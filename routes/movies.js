const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getMovies, createMovie, deleteMovie,
} = require('../controllers/movies');
const { REGULAR_URL } = require('../utils/constants');

router.get('/', getMovies);

router.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.number().required(),
    description: Joi.string().required(),
    image: Joi.string()
      .required()
      .pattern(REGULAR_URL),
    trailerLink: Joi.string()
      .required()
      .pattern(REGULAR_URL),
    thumbnail: Joi.string()
      .required()
      .pattern(REGULAR_URL),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), createMovie);

router.delete('/:movieDbId', celebrate({
  params: Joi.object().keys({
    movieDbId: Joi.string().length(24).hex().required(),
  }),
}), deleteMovie);

module.exports = router;
