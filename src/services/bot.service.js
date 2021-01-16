const Message = require('../models/message');

class BotService {
  constructor(bot) {
    this.bot = bot;
  }

  async saveMessage(msg, date) {
    const result = await Message.create({ date, textMessage: msg });
    return result;
  }

  async find(fromDate, toDate) {
    console.log(`Buscando mensajes desde ${fromDate} hasta ${toDate}`);
    const result = await Message.find(
      {
        date: { $gte: fromDate, $lte: toDate },
      },
      'textMessage -_id',
      { sort: { date: 'asc' }, rawResult: true }
    );
    return result;
  }
}

module.exports = BotService;
