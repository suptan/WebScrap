var express       = require('express');
var fs            = require('fs');
var request       = require('request');
var cheerio       = require('cheerio');
var app           = express();
var commaNum      = require('comma-number')
const {stopwatch} = require('durations')
var async         = require('async')
var cal           = require('./calculator');
let screener      = require('./screener.js');

app.get('/scrape', function(req, res){
  const sw = stopwatch()
  let codeList = screener.givenArray();

  //let que = async.queue(function(task, done){
  async.map(codeList, function(scode, done){
    //let scode = task.scode
    console.log(`Task ${scode}`)
    url = `https://www.set.or.th/set/companyhighlight.do?symbol=${scode}&ssoPageId=5&language=en&country=US`;
    //url = 'https://www.set.or.th/set/companyhighlight.do?symbol=HANA&ssoPageId=5&language=th&country=TH';
  
    sw.reset()
    // Starts the stopwatch from where it was last stopped.
    sw.start()
  
    request(url, function(error, response, html) {
      if(!error){
        exteacted(scode, html)
      }
  
      /*fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
        console.log('File successfully written! - Check your project directory for the output.json file');
      })*/
  
      sw.stop()
      console.log(`${scode} ${sw} have elapsed`)
      done()
    })
  }, function(err, res) {
    console.log(err, res)
  })

  /*que.drain = function() {
    console.log('all items have been processed');
  }

  for(let i = 0, len = codeList.length; i < len; i++) {
    que.push({scode: codeList[i]}, function(err) {
      console.log(`Error at ${codeList[i]}: ${err}`)
    })
  }*/

  // End app
  res.send('Check your console!')
})

function exteacted(scode, html) {
  console.log('call successfully');
  var $ = cheerio.load(html);

  var finData = [];
  let title, release, rating, divide = 1, price = 0, indicator = 10;
  var json = { title : "", release : "", rating : ""};
  var isLastColValid = false;

  // Find finance table
  $('.table-info').filter(function() {
    // Find latest Quater
    $('thead').first().filter(function() {
      var elements = $(this).find('th').get().reverse();
      $(elements).each(function() {
        var text = $(this).find('strong').text().trim()
        if(text) {
          switch(true) {
            case /Y/.test(text):
              divide = 4
              break;
            case /Q3/.test(text):
              divide = 3
              break;
            case /Q2/.test(text):
              divide = 2
              break;
          }
          return false;
        }
      })
    })
    let fair = cal.processIncomeStatement($('tbody').first(), divide)
    price = cal.processBalanceSheet($('tbody')[1])

    console.log(`${scode} ${commaNum(fair)} vs ${price}`)
  })
}

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;
