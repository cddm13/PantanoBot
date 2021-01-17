const log = require('pino')();
const Message = require('../models/message');

class BotService {
  static async saveMessage(msg, date) {
    const result = await Message.create({ date, textMessage: msg });
    return result;
  }

  static async find(fromDate, toDate) {
    log.info(`Buscando mensajes desde ${fromDate} hasta ${toDate}`);
    const result = await Message.find(
      {
        date: { $gte: fromDate, $lte: toDate },
      },
      'textMessage -_id',
      { sort: { date: 'asc' }, rawResult: true },
    );
    return result;
  }
}

module.exports = BotService;
