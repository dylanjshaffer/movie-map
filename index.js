// index.js
var trim = require('trim');
var wtj = require('website-to-json');

wtj.extractURL('http://www.imdb.com/title/tt0111161/locations', {
  fields: ['data'],
  parse: function($) {
    return {
      locations: trim($("#filming_locations_content a").text()),
      remarks: trim($("#filming_locations_content dd").text())
    }
  }
})
.then(function(ressponse) {
  console.log(JSON.stringify(res, null, 2));
})
