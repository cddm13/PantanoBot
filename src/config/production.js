const defaults = require('./defaults');

module.exports = {
  ...defaults,
  database: {
    ...defaults.database,
    url: process.env.DATABASE_URL,
  },
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
  },
};
