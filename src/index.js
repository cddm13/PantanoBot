const mongoose = require('mongoose');
const log = require('pino')();
const { Telegraf } = require('telegraf');
const { DateTime } = require('luxon');
const BotService = require('./services/bot.service');
const { env, database, botToken } = require('./config');

const {
  user, password, name, port, host,
} = database;
const dbUrl = env !== 'production'
  ? `mongodb://${user}:${password}@${host}:${port}/${name}?authSource=admin`
  : database.url;
const bot = new Telegraf(botToken);

mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    log.info('Connected to DB');
    log.info('BOT initialized');

    bot.start((ctx) => {
      log.info(`${ctx.botInfo.username} has been activated`);
      ctx.reply(`${ctx.botInfo.username} has been activated`);
    });

    bot.help((ctx) => {
      ctx.reply(`This bot can perform the following commands:
        /start - To start the bot,
        /help - See help,
        /ats - Add a message to the summary
        /resumen tiempo - (hoy, ayer, *) Ej: "/resumen hoy" 
      `);
    });

    bot.command('ats', async (ctx) => {
      if (!ctx.message.reply_to_message) return ctx.reply('No hay nada que agregar \u{1F640} ');
      const { date, text: msg } = ctx.message.reply_to_message;
      if (!ctx.message.reply_to_message.text) return ctx.reply('\u{1F6AB} Solo se puede agregar texto');

      if (ctx.message.reply_to_message.from.is_bot) return ctx.reply('\u{1F6AB} No se deben agregar los mensajes de un bot al resumen');
      const d = new Date(date * 1000).toLocaleString('es-CL', {
        timeZone: 'America/Santiago',
      });
      log.info(`Ok saving ${msg} with date ${d} into the database`);
      await BotService.saveMessage(msg, date * 1000);
      return log.info('message saved.');
    });

    bot.command('resumen', async (ctx) => {
      const [, dateArg = 'hoy'] = ctx.message.text.trim().split(' ');
      let messages = null;
      let initialDate;
      let finalDate;
      switch (dateArg) {
        case 'hoy':
          initialDate = DateTime.local().startOf('day').toString();
          finalDate = DateTime.local().endOf('day').toString();
          messages = await BotService.find(initialDate, finalDate);
          break;
        case 'ayer':
          log.info('Buscando los de ayer');
          initialDate = DateTime.local().startOf('day').minus({ days: 1 }).toString();
          finalDate = DateTime.local().endOf('day').minus({ days: 1 }).toString();
          messages = await BotService.find(initialDate, finalDate);
          break;
        case '*':
          initialDate = DateTime.local().startOf('month').toString();
          finalDate = DateTime.local().toLocal('America/Santiago').toString();
          messages = await BotService.find(initialDate, finalDate);
          break;
        default:
          return ctx.reply(`Opción incorrecta, puedes elegir una de las siguientes: 
            -hoy
            -ayer
            -* (desde inicio de mes)
          `);
      }
      if (!messages || !messages.length) return ctx.reply('No encontré mensajes almacenados para resumen');
      let response = 'Lo que tengo para resumir es: \u{1F4D1}';
      // eslint-disable-next-line no-return-assign
      messages.forEach((m, idx) => (response += `\n${idx + 1}- ${m.textMessage}.`));
      return ctx.reply(response);
    });

    bot.launch();
  })
  .catch((err) => {
    log.error(`Error starting database ${err.message}`);
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  });
