const defaults = require('./defaults');

module.exports = {
  ...defaults,
  database: {
    ...defaults.database,
    url: process.env.DATABASE_URL,
  },
};
