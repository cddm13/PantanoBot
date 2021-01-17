const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const { DateTime } = require('luxon');
const { env, database, botToken } = require('./config');
const BotService = require('./services/bot.service');

const user = database.user;
const password = database.password;
const dbName = database.name;
const dbPort = database.port;
const dbHost = database.host;
const dbUrl =
  env !== 'production'
    ? `mongodb://${user}:${password}@${dbHost}:${dbPort}/${dbName}?authSource=admin`
    : database.url;

const bot = new Telegraf(botToken);

mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to DB');
    console.log('BOT initialized');
    const botService = new BotService(bot);

    bot.start((ctx) => {
      console.log(`${ctx.botInfo.username} has been activated`);
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
      if (!ctx.message.reply_to_message)
        return ctx.reply(`No hay nada que agregar \u{1F640} `);
      const { date, text: msg } = ctx.message.reply_to_message;
      if (ctx.message.reply_to_message.from.is_bot)
        return ctx.reply(
          '\u{1F6AB} No se deben agregar los mensajes de un bot al resumen'
        );
      const d = new Date(date * 1000).toLocaleString('es-CL', {
        timeZone: 'America/Santiago',
      });
      console.log(`Ok saving ${msg} with date ${d} into the database`);
      await botService.saveMessage(msg, date * 1000);
      console.log('message saved.');
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
          messages = await botService.find(initialDate, finalDate);
          break;
        case 'ayer':
          console.log('Buscando los de ayer');
          initialDate = DateTime.local()
            .startOf('day')
            .minus({ days: 1 })
            .toString();
          finalDate = DateTime.local()
            .endOf('day')
            .minus({ days: 1 })
            .toString();
          messages = await botService.find(initialDate, finalDate);
          break;
        case '*':
          initialDate = DateTime.local().startOf('month').toString();
          finalDate = DateTime.local().toLocal('America/Santiago').toString();
          messages = await botService.find(initialDate, finalDate);
          break;
        default:
          return ctx.reply(`Opción incorrecta, puedes elegir una de las siguientes: 
            -hoy
            -ayer
            -* (desde inicio de mes)
          `);
      }
      if (!messages || !messages.length)
        return ctx.reply('No encontré mensajes almacenados para resumen');
      let response = `Lo que tengo para resumir es: \u{1F4D1}`;
      messages.map((m, idx) => (response += `\n${idx + 1}- ${m.textMessage}.`));
      ctx.reply(response);
    });

    bot.launch();
  })
  .catch((err) => {
    console.error(err);
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  });
