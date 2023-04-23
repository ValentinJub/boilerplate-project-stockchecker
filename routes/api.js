'use strict';

const User = require("../models/user");
const crypto = require("crypto");
module.exports = function (app) {

app.route('/api/stock-prices').get(async function (req, res) {
  try {
    let { stock, like } = req.query;
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(ip);

    if (Array.isArray(stock)) {
      // Code for comparing two stocks
      let [stock1, stock2] = stock;
      const data1 = await fetchStockData(stock1);
      const data2 = await fetchStockData(stock2);
      await handleUser(ip);
      const likes1 = await handleLike(like, stock1, ip);
      const likes2 = await handleLike(like, stock2, ip);
      res.send({
        "stockData": [
          {
            stock: data1.symbol,
            price: data1.latestPrice,
            rel_likes: likes1 - likes2
          },
          {
            stock: data2.symbol,
            price: data2.latestPrice,
            rel_likes: likes2 - likes1
          }
        ]
      });
    } else {
      const data = await fetchStockData(stock);
      //check if user exists
      await handleUser(ip);
      const likes = await handleLike(like, stock, ip);
      // console.log("number of likes: ", likes)
      // console.log(data);
      res.send({
        "stockData": {
          stock: data.symbol,
          price: data.latestPrice,
          likes: likes
        }
      });
    }
    console.log(stock, like);
  } catch (err) {
    console.log(err);
  }
});
};

async function handleLike(like, stock, ip) {
  if(like === "true") {
    await addLike(ip, stock)
  }
  return await countLikes(stock);
}

async function handleUser(ip) {
  let hash = hashIP(ip);
  let user = await findUser(hash);
  if(!user) {
    user = await createUser(hash);
  }
}

async function fetchStockData(stock) {
  return new Promise((resolve, reject) => {
    fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`).then(
      response => resolve(response.json()),
      err => reject(err)
    );
  });
}

function countLikes(stock) {
  return new Promise((resolve, reject) => {
    User.find({ likes: stock }).then(
      data => resolve(data.length),
      err => reject(err)
    );
  });
}

function findUser(ip) {
  let hash = hashIP(ip); 
  return new Promise((resolve, reject) => {
    User.findOne({username: hash}).then(
      data => resolve(data),
      err => reject(err)
    );
  });
}

function createUser(ip) {
  let hash = hashIP(ip); 
  return new Promise((resolve, reject) => {
    let user = new User({username: hash});
    user.save().then(
      data => resolve(data),
      err => reject(err)
    )
  });
}

async function addLike(ip, stock) {
  let hash = hashIP(ip); 
  try {
    let user = await findUser(hash);
    if(user.likes.indexOf(stock) === -1) {
      user.likes.push(stock);
      await user.save();
    }
  }
  catch(err) {
    console.log(err);
  } 
}

function hashIP(ip) {
  return crypto.createHash("md5").update(ip).digest("hex"); 
}