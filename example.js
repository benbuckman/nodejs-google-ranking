var util = require('util');

var gr = require('./google-ranking');

gr.getGoogleRanking("node.js", "nodejs.org", function(error, result) {
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log(util.inspect(result,true,10));
});