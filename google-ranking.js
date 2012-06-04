
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
    - body > #main #cnt #foot #xjs #navcnt #nav [td.navend] > a | a#pnnext    (differs in js/js-less modes)
    - [simpler] #nav a#pnnext
*/


var gBase = 'http://www.google.com';    // maybe expand to other languages?

// returns the search URL for a query and page
var searchUrl = function(searchPhrase) {
  // spaces=>+, otherwise escape
  searchPhrase = escape( searchPhrase.replace(/ /g, '+') );
  var url = gBase + '/search?hl=en&output=search&q=' + searchPhrase + '&';
  // [no longer using pages this way, see below]
  // if (!isNaN(pageNum) && pageNum > 1) url += 'start=' + (10*pageNum) + '&';
  return url;
};

// searchPhrase: string to search for
// callback gets error or array of results
var getGoogleResults = function getGoogleResults(searchPhrase, callback) {

  var jscrape = require('jscrape'),   // lazy combo of jquery+jsdom+request
      async = require('async');

  // (default 'Windows NT 6.0' probably looks fishy coming from a Linux server)
  jscrape.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_4) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.52 Safari/536.5';
  
  var results = [],
      pageNum = 1,
      url = searchUrl(searchPhrase);
  
  
  // get 10 pages of results. get the next-page url from the results of each.
  // (could just use start=N param, but seems more authentic to follow actual results link.
  //  also maybe less likely to raise red flags)
  async.whilst(
    function test() { return pageNum <= 10; },
    
    function getNextPage(next) {
      // console.log('page', pageNum, url);
      
      jscrape(url, function (error, $, response, body) {
        if (error) return next(error);
        if (!$) return next(new Error("Missing jQuery object"));

        // (highly unlikely)
        if (response.statusCode !== 200) return next(new Error("Bad status code " + response.statusCode));

        // add this page's results (in order)
        $('#search ol li').each(function(){
          var $vsc = $(this).find('div.vsc');
          results.push({
            title: $vsc.find('> h3 > a').text(),
            url: $vsc.find('> div.s > .f > cite').text(),
            description: $vsc.find('> div.s > .st').text(),
            page: pageNum,
            ranking: results.length
          });
        });
        
        
        // parse the Next link
        var nextPageUrl = $('#nav a#pnnext').attr('href');
        if (typeof nextPageUrl == 'undefined' || nextPageUrl === null || nextPageUrl === '') {
          // (maybe the query just doesn't have a lot of results??)
          return next(new Error("Unable to find next page link in results"));
        }
        // should be a relative url
        else if (/^http/.test(nextPageUrl)) {
          return next(new Error("Next-page link is not in expected format"));
        }
        url = gBase + nextPageUrl;        

        pageNum++;
        next();
      });
    },
    
    function done(error) {
      if (error) return callback(error);
      callback(null, results);
    }
  );

};
module.exports.getGoogleResults = getGoogleResults;




// find where in the top 100 results a match is found.
// urlChecker:
//  - can be a string, then visible URL is indexOf'd w/ the string. LEAVE OFF http://
//  - can be a function, gets a result array (w/url, title, description), should return true on match.
// callback gets [error, result] where result contains page & ranking, or false if not found.
var getGoogleRanking = function getGoogleRanking(searchPhrase, urlChecker, callback) {
  if (typeof urlChecker === 'string')
    urlChecker = defaultUrlChecker(urlChecker);
  else if (typeof urlChecker !== 'function')
    throw new Error('urlChecker needs to be a string or a function');

  getGoogleResults(searchPhrase, function(error, results) {
    if (error) return callback(error);
    if (typeof results.length === 'undefined') return callback(null, false);
    
    for (var ranking = 0; ranking < results.length; ranking++) {
      result = results[ranking];
      
      if (urlChecker(result) === true) {
        callback(null, result);
        break;
      }
    }
    
    return false; // not found
  });
};

module.exports.getGoogleRanking = getGoogleRanking;


// default urlChecker for a string match. returns a function.
var defaultUrlChecker = function(url) {
  return function(result) {
    if (typeof result.url !== 'undefined')
      if (result.url.indexOf(url) !== -1)
        return true;
  };
};
