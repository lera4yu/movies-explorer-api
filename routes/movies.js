const router = require('express').Router();
const {
  getMovies, createMovie, deleteMovie,
} = require('../controllers/movies');
const { validateMovie, validateMovieId } = require('../middlewares/validation');

router.get('/', getMovies);

router.post('/', validateMovie, createMovie);

router.delete('/:movieDbId', validateMovieId, deleteMovie);

module.exports = router;
