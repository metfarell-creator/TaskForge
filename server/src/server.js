const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`TaskForge API listening on port ${config.port}`);
});

module.exports = server;
