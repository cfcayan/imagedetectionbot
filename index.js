/* eslint-disable no-unused-vars */
// import * as cocoSsd from '@tensorflow-models/coco-ssd';
const cocoSsd = require('@tensorflow-models/coco-ssd');
const tf = require('@tensorflow/tfjs');
const TelegramBot = require('node-telegram-bot-api');
const token = '717272330:AAGzD3QYCx3BT22xekjjlFyp9sRhswSrnL0';
const bot = new TelegramBot(token, {polling: true});
// Load the binding
const tfnode = require('@tensorflow/tfjs-node');
const {createCanvas, Image} = require('canvas');
const fs = require("fs");

// Or if running with GPU:
// import '@tensorflow/tfjs-node-gpu';

let model;

// base?: 'mobilenet_v1' | 'mobilenet_v2' | 'lite_mobilenet_v2'
let detectionVersion = 'lite_mobilenet_v2';
cocoSsd.load(detectionVersion).then((objectDetectionR) => {
  console.log('loaded', objectDetectionR);
  model = objectDetectionR;
}).catch((error) => {
  console.error('fail', error);
});

bot.on('message', (msg) => {
  console.log('incoming message', msg);
  console.log('photo?', msg.photo ? msg.photo.length : 'no');

  if (msg.text && msg.text.toString().toLowerCase().indexOf('hi') === 0) {
    bot.sendMessage(msg.chat.id, 'Hello dear user');
  } else {
    console.log('no');
  }

  if (msg.photo && msg.photo.length > 0) {
    console.log('there is a photo');
    bot.sendMessage(msg.chat.id, 'OK, I will take a look at this photo...');
    // get the photo with highest quality
    let p = msg.photo[msg.photo.length - 1];
    console.log('p', p);

    bot.getFileLink(p.file_id).then((file) => {
      console.log('file', file);

      const canvas = createCanvas(p.width, p.height);
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.src = file;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        // const input = tf.fromPixels(canvas);
        model.detect(canvas).then((result) => {
          console.log('cooooool', result);

          result.forEach((element)=>{
            bot.sendMessage(msg.chat.id, 'found a ' + element.class);
          });


          const c1 = createCanvas(p.width, p.height);
          const context = c1.getContext('2d');
          context.drawImage(img, 0, 0);
          context.font = '10px Arial';

          console.log('number of detections: ', result.length, result);
          for (let i = 0; i < result.length; i++) {
            context.beginPath();
            context.rect(...result[i].bbox);
            context.lineWidth = 1;
            context.strokeStyle = 'green';
            context.fillStyle = 'green';
            context.stroke();
            context.fillText(
                result[i].score.toFixed(3) + ' ' + result[i].class, result[i].bbox[0],
                result[i].bbox[1] > 10 ? result[i].bbox[1] - 5 : 10);
          }

          let buf = c1.toBuffer();
          fs.writeFileSync(msg.message_id + ".jpg", buf);
          bot.sendPhoto(msg.chat.id, buf).then(()=>{
            console.log("photo send");
          }).catch((error)=> {
            console.error("error", error);
          });
        }).catch((error) => {
          console.log('error', error);
        });
      };


      //   getDataUri(file).then((r)=>{
      //     console.log('got image', r);
      //   }).catch();
      // }).catch((error) => {
      //   console.error('e', error);
    });
  }
});


bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Welcome');
});


function getDataUri(url) {
  return new Promise((resolve, reject) => {
    let image = new Image();

    image.onload = function() {
      // let canvas = document.createElement('canvas');
      let canvas = Canvas.createCanvas();
      canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
      canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

      canvas.getContext('2d').drawImage(this, 0, 0);

      // Get raw image data
      // callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));
      // ... or get as Data URI
      callback(canvas.toDataURL('image/png'));
      resolve(canvas.toDataURL('image/png'));
    };

    image.src = url;
  });
}
