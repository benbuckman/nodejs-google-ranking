[![build status](https://secure.travis-ci.org/newleafdigital/nodejs-google-ranking.png)](http://travis-ci.org/newleafdigital/nodejs-google-ranking)
# Node.js module: Google Ranking

A node.js module that fetches Google search results, or the Google search ranking for a phrase.

`npm install google-ranking`

Example use case: Measure your business's rankings for strategic keywords and plot them on a graph over time.

Example code: see **example.js**


## Disclaimer

Using this module might be a violation of Google's [Terms of Service](http://www.google.com/terms_of_service.html). I take no responsibility for the way you use it. Any violation of Google's TOS resulting from using this module is entirely the user's responsibility.


## Methods

### `getGoogleRanking(searchPhrase, urlChecker, callback)`

Finds where in the top 100 results a match is found.
(Only gets as many as needed, doesn't get 100 if found earlier)

`urlChecker` can be:
 - a string, then visible URL is indexOf'd w/ the string. (Leave off _http://_)
 - a function, gets a result array (w/url, title, description), should return true on match.

`callback` gets `error, result where result contains: title, url, description, page, ranking; or false if not found.

### `getGoogleResults(searchPhrase, callback)`

Gets the top 100 results for a search query, passes them as an array to callback.
