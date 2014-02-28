var fs = require("fs");
var request = require('request');
var pack = require('./package.json');
var _ = require('underscore');

function main() {

  var contribApi = pack.repository.url.split('/');
  // Request info from github repo
  var options = {
    url: 'https://api.github.com/repos/'+contribApi[3]+'/'+contribApi[4]+'/contributors?client_id=ebb50cd63049a8f68cec&client_secret=9d580524b9135c545dc697820c170d2c737604fe',
    headers: {
      'User-Agent': 'request'
    }
  };
  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      var contributors = [];
      i=0;
      info.forEach(function(contributor){
        // User info request
        var userOptions = {
          url: contributor.url+'?client_id=ebb50cd63049a8f68cec&client_secret=9d580524b9135c545dc697820c170d2c737604fe',
          headers: {
            'User-Agent': 'request'
          }
        };

        function userCallback(error, response, body) {
          if (!error && response.statusCode == 200) {
            var userInfo = JSON.parse(body);
            var user = new Object();
            user.name = userInfo.name;
            user.email = userInfo.email;
            user.url = userInfo.html_url;
            user.hireable = userInfo.hireable;
            contributors.push(user);
          }
          // now Save the data
          var fileName = './package.json';
          i++;
          if(i == info.length){
            saveData(fileName, contributors);
          }
        }
        // Make user info request
        request(userOptions, userCallback);
        
      });
    }
  }
  // Make request for info from repo
  request(options, callback);

  // Save new file 
  function saveData(file, data) {
    // Empty the contributors array
    // pack.contributors = [];
    // Save backup to .package.json
    fs.writeFile('./.package.json', JSON.stringify(pack, null, 2), function(err) {
      if(err) {
        console.log(err);
      } else {
        console.info("Saved a backup as", './.package.json');
      }
    }); 

    // Rewrite package.json
    // Fill the array with list from github
    pack.contributors = data;
    fs.writeFile(file, JSON.stringify(pack, null, 2), function(err) {
      if(err) {
        console.log(err);
      } else {
        console.info("contributors added to", file);
      }
    }); 
  }

}

main();