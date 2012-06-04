
/*
== HTML structure ==
  search results:
    - body > #main #cnt .mw #rcnt #center_col #search ol li
    - [simpler] #search ol li
  
    inside each li:
      > div.vsc > h3 > a                = link, take .text() for title, don't take the href
      > div.vsc > div.s > .f > cite     = visible url, take .text()
      > div.vsc > div.s > .st           = description
  
  pager:
    - body > #main #cnt #foot #xjs #navcnt #nav td.navend > a
    - [simpler] #nav td.navend > a
*/


// returns the search URL for a query and page
var searchUrl = function(searchPhrase, pageNum) {
  var url = 'http://www.google.com/search?hl=en&output=search&q=' + escape(searchPhrase);
  if (!isNaN(pageNum) && pageNum > 1) url += 'start=' + (10*pageNum);
  url += '&';
  return url;
};

// searchPhrase: string to search for
// urlChecker: url string to compare or function to check each url against
// options...
// callback...
var getGoogleResults = function getGoogleResults(searchPhrase, callback) {

  var jscrape = require('jscrape'),   // lazy combo of jquery+jsdom+request
      async = require('async'),
      util = require('util');

  // (default 'Windows NT 6.0' probably looks fishy coming from a Linux server)
  jscrape.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_4) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.52 Safari/536.5';
  
  var results = [];
  
  var urls = [];
  for (var i=1; i<=10; i++) urls.push( searchUrl(searchPhrase, i) );
  
  async.forEachSeries(urls, function(url, next) {
    jscrape(url, function (error, $, response, body) {
      if (error) return next(error);
      if (!$) return next(new Error("Missing jQuery object"));

      // (highly unlikely)
      if (response.statusCode !== 200) return next(new Error("Bad status code " + response.statusCode));

      var pageResults = $('#search ol li').map(function(){
        var $vsc = $(this).find('div.vsc');
        return {
          title: $vsc.find('> h3 > a').text(),
          url: $vsc.find('> div.s > .f > cite').text(),
          description: $vsc.find('> div.s > .st').text()
        };
      }).get();

      results = results.concat(pageResults);

      next();
    });
  },
  function done(error) {
    if (error) return callback(error);
    callback(null, results);
  });
  
};
module.exports.getGoogleResults = getGoogleResults;

//module.exports = function getGoogleRanking(searchPhrase, urlChecker, options, callback) {