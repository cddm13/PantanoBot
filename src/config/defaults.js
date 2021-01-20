require('dotenv').config();

module.exports = {
  database: {
    name: process.env.DATABASE_NAME || 'telegram-bot',
    user: process.env.DATABASE_USERNAME || 'test-bot',
    password: process.env.DATABASE_PASSWORD || 'test-bot',
    port: parseInt(process.env.DATABASE_PORT, 10) || 27018,
    host: process.env.DATABASE_HOST || 'localhost',
  },
  env: process.env.NODE_ENV || 'development',
  botToken: process.env.BOT_TOKEN || 'token',
};
