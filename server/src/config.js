const dotenv = require('dotenv');

dotenv.config();

const config = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || 'taskforge-dev-secret',
  tokenExpiry: process.env.JWT_EXPIRY || '1h'
};

module.exports = config;
