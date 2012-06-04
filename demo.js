var util = require('util');

var gr = require('./google-ranking');

// gr.getGoogleResults("Antique Shows near Boston", function(error, results) {
//   if (error) throw error;  
//   console.log('\n\nresults:', util.inspect(results,true,10));
// });

gr.getGoogleRanking("Antique Shows near Boston", "antiquesnearme.com", function(error, result) {
  if (error) throw error;
  console.log(util.inspect(result,true,10));
});