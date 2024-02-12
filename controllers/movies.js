const Movie = require('../models/movie');

const NotFoundError = require('../errors/NotFoundError');
const InputError = require('../errors/InputError');
const AuthNotFoundError = require('../errors/AuthNotFoundError');
const {
  authNotFoundMessage,
  inputMessageData,
  inputMessageMovie,
  notFoundMessageMovie,
} = require('../utils/messages');

module.exports.getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => res.send({ data: movies }))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  const owner = req.user._id;
  Movie.create(
    {
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      nameRU,
      nameEN,
      thumbnail,
      movieId,
      owner,
    },
  )
    .then((movie) => res.status(201).send({ data: movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new InputError(inputMessageData));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieDbId)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError(notFoundMessageMovie);
      } else if (req.user._id !== movie.owner.toString()) {
        throw new AuthNotFoundError(authNotFoundMessage);
      } else {
        return Movie.deleteOne(movie)
          .then(() => res.send({ data: movie }));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new InputError(inputMessageMovie));
      } else {
        next(err);
      }
    });
};
