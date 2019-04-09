const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/';
const dbName = 'huya';
const collectionName = 'chat';

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  const dbo = db.db(dbName);
  dbo.collection(collectionName)
    .find({})
    .project({_id: 0})
    .toArray(function(err, result) {
      if (err) throw err;
      console.log(result.length);
      let data = '';
      result.forEach((record) => {
        if (!record) { return; }
        data += `${JSON.stringify(record)}\n`;
      }); 
      fs.writeFile(
        'chat.txt', 
        data,
        {flag: 'w'},
        (err) => { if (err) { throw err; } }
      );
      db.close();
    });
});






