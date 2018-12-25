const TelegramBot = require('node-telegram-bot-api');
const token = '717272330:AAGzD3QYCx3BT22xekjjlFyp9sRhswSrnL0';
const bot = new TelegramBot(token, {polling: true});

var Hi = 'hi';

bot.on('message', (msg) => {
  console.log('incoming message', msg);
  console.log('photo?', msg.photo ? msg.photo.length : 'no');

  if (msg.text && msg.text.toString().toLowerCase().indexOf(Hi) === 0) {
    bot.sendMessage(msg.chat.id, 'Hello dear user');
  } else {
    console.log("no");
  }

  if (msg.photo && msg.photo.length > 0) {
    console.log('there is a photo');
    bot.sendMessage(msg.chat.id, 'OK, I will take a look at this photo...');
    // get the photo with highest quality
    var p = msg.photo[msg.photo.length-1];
    console.log("p", p);

    bot.getFileLink(p.file_id).then((file) => {
      console.log("file", file);
    }).catch((error)=> {
      console.error("e", error);
    });

  }
});


bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Welcome');
});
