const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('GET /api/stock-prices => stockData object', function() {
    this.timeout(5000);
    test('viewing one stock', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'nabl'})
        .end(function(err, res){
          if(err) console.log(err);
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'NABL');
          assert.isNumber(res.body.stockData.price);
          assert.isNumber(res.body.stockData.likes);
          done();
        });
    });
    let witness = 0
    test('viewing one stock and liking it', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'gme', like: "true"})
        .end(function(err, res){
          if(err) console.log(err);
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'GME');
          assert.isNumber(res.body.stockData.price);
          assert.isNumber(res.body.stockData.likes);
          witness = res.body.stockData.likes
          assert.isAbove(res.body.stockData.likes, 0);
          done();
        });
    });
    test('viewing the same stock and liking it again', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'gme', like: "true"})
        .end(function(err, res){
          if(err) console.log(err);
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'GME');
          assert.isNumber(res.body.stockData.price);
          assert.isNumber(res.body.stockData.likes);
          assert.equal(res.body.stockData.likes, witness);
          done();
        });
    });
    test('viewing two stocks', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['nabl', 'meta']})
        .end(function(err, res){
          if(err) console.log(err);
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData[0].stock, 'NABL');
          assert.equal(res.body.stockData[1].stock, 'META');
          assert.isNumber(res.body.stockData[0].price);
          assert.isNumber(res.body.stockData[0].rel_likes);
          assert.isNumber(res.body.stockData[1].price);
          assert.isNumber(res.body.stockData[1].rel_likes);
          done();
        });
    });
    test('viewing two stocks and liking them', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['nabl', 'meta'], like: "true"})
        .end(function(err, res){
          if(err) console.log(err);
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData[0].stock, 'NABL');
          assert.equal(res.body.stockData[1].stock, 'META');
          assert.isNumber(res.body.stockData[0].price);
          assert.isNumber(res.body.stockData[0].rel_likes);
          assert.isNumber(res.body.stockData[1].price);
          assert.isNumber(res.body.stockData[1].rel_likes);
          done();
        });
    });
  });
});
