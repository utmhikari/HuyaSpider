const HuyaDanmu = require('huya-danmu');
// 数据库（根据数据库配置而定）
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/';
const dbName = 'huya';

// 房间号（改动这个）
const roomid = process.argv.length >= 3 ? process.argv[2] : '';
if (!roomid) {
  console.error('未指定房间号！用法 ------ node index.js 房间号');
  process.exit(-1);
}

// 监听Client
const client = new HuyaDanmu(roomid);
let count = 0;
const reconnectInterval = 60000;

const connect = () => {
  // 连接事件
  client.on('connect', () => {
    console.log(`已连接虎牙${roomid}房间弹幕~`);
  });

  // 监听到弹幕事件
  client.on('message', msg => {
    count += 1;
    // 加工信息
    const info = {
      room: roomid,
      ...msg,
      time: new Date(),
    };
    // 输出chat类型弹幕信息（文字弹幕）
    const infoType = info.type;
    if (infoType === 'chat') {
      console.log(`number: ${count}`);
      Object.keys(info).forEach(key => {
        const val = key === 'from' ? JSON.stringify(info[key]) : info[key];
        console.log(`${key}: ${val}`);
      });
      console.log('');
    }
    // 存至数据库
    MongoClient.connect(url, function (err, db) {
      if (err) { 
        console.error(err); 
      } else {
        const dbo = db.db(dbName);
        dbo.collection(infoType).insertOne(info, function (err) {
          if (err) {
            console.error(err);
          }
          db.close();
        });
      }
    });
  });

  // 错误事件
  client.on('error', e => {
    console.error(e);
  });

  // 断连事件
  client.on('close', () => {
    console.log(`Connection closed! Obtained ${count} messages! Try to reconnect in 1 minute...`);
    try {
      setTimeout(client.start(), reconnectInterval);
    } catch (err) {
      console.error(err);
    }
  });

  // 启动监听
  client.start();
};

connect();






