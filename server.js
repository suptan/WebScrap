var express       = require('express');
var fs            = require('fs');
var request       = require('request');
var cheerio       = require('cheerio');
var app           = express();
var cal           = require('./calculator');
var commaNum      = require('comma-number')
const {stopwatch} = require('durations')

app.get('/scrape', function(req, res){
  const sw = stopwatch()
  let scode = 'HANA'
  url = `https://www.set.or.th/set/companyhighlight.do?symbol=${scode}&ssoPageId=5&language=en&country=US`;
  //url = 'https://www.set.or.th/set/companyhighlight.do?symbol=HANA&ssoPageId=5&language=th&country=TH';

  sw.reset()
  // Starts the stopwatch from where it was last stopped.
  sw.start()

  request(url, function(error, response, html){
    if(!error){
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
        let fair = cal.processIncomeStatement($, $('tbody').first(), divide)
        price = cal.processBalanceSheet($, $('tbody')[1])


        console.log(commaNum(fair), "vs", price)
      })
    }

    /*fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
      console.log('File successfully written! - Check your project directory for the output.json file');
    })*/
    res.send('Check your console!')

    sw.stop()
    console.log(`${sw} have elapsed`)
  })
})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;
