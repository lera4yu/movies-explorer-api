require('dotenv').config();

const { NODE_ENV, SECRET_SIGNING_KEY, DB_URL } = require('./constants');

module.exports.getSecret = () => (NODE_ENV === 'production' ? SECRET_SIGNING_KEY : 'dev-secret');

module.exports.getDbUrl = () => (NODE_ENV === 'production' ? DB_URL : 'mongodb://127.0.0.1:27017/bitfilmsdb-dev');
