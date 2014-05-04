/*
 * contributor.js: a package.json contributor customizer
 *
 * (C) 2014 Jake LeBoeuf
 * MIT LICENCE
 *
 */
var path       = require('path'),
    fs         = require('fs'),
    request    = require('request'),
    Github     = require('github'),
    color      = require("ansi-color").set,
    prompt     = require("prompt"),
    yesno      = require("yesno"),
    rootDir    = process.cwd(),
    sourceJson = path.join(rootDir, 'package.json'),
    dupJson    = path.join(rootDir, '.package.json'),
    pack       = require(sourceJson);


if(!pack.repository) {
  console.log(color('No Repository info found in your package.json.', 'red+bold'));
  console.log(color('See the npm docs for formatting guidelines: https://www.npmjs.org/doc/json.html#repository', 'magenta'));
  
  // Jankfully kill the process
  process.kill();
  return;
} else {
  if(!pack.repository.url) {

    console.log(color('No Repository url found in your package.json.', 'red+bold'));
    console.log(color('See the npm docs for formatting info: https://www.npmjs.org/doc/json.html#repository', 'magenta'));
    
    // Jankfully kill the process
    process.kill();
    return;
  } else {
    contribApi = pack.repository.url.split('/');
  }
}


// *****************************
// Contributor Module + Defaults
// *****************************
var contributor = module.exports = {
  complete: 0,
  username: contribApi[3],
  password: null,
  repo: contribApi[4].split('.')[0],
};


// *****************
// Do all the things
// *****************
contributor.start = function (next) {

  // Request info from github repo
  var options = {
    url: 'https://api.github.com/repos/'+
      contributor.username+
      '/'+contributor.repo+
      '/contributors',
    headers: {
      'User-Agent': 'request'
    }
  };
  function callback(error, response, body) {
    // If repo is private
    if(response.statusCode === 404) {
      console.log(color('Please login to Github to access this private repo:', 'magenta'));

      // Prompt:
       var schema = {
        properties: {
          username: {
            pattern: /^[a-zA-Z\s\-]+$/,
            message: 'Name must be only letters, spaces, or dashes',
          },
          password: {
            hidden: true,
            required: true,
            error: 'Password cannot be blank... (You will not see it when you type.) ',
          }
        }
      };
      prompt.message = 'Github'.green.bold;
      prompt.start();
      prompt.get(schema, function (err, result) {
        // Get repo data with authentication
        if(err){
          console.log(color('Opperation Canceled', 'red+bold'));
          return;
        }
        var github = new Github({
          // required
          version: "3.0.0",
          // optional
          debug: false,
          protocol: "https",
          host: "api.github.com",
          timeout: 5000
        });
        github.authenticate({
          type: "basic",
          username: result.username,
          password: result.password,
        });
        github.repos.getContributors({
          user: contributor.username,
          repo: contributor.repo
        }, function(err, res) {
          info = res;
          var contributors = [];
          i=0;
          info.forEach(function(contributor){
            var contributions = 0;

            // User info request
            var userOptions = {
              url: contributor.url,
              headers: {
                'User-Agent': 'request'
              }
            };

            function userCallback(error, response, body) {
              if (!error && response.statusCode === 200) {
                var userInfo = JSON.parse(body);
                var user = new Object();
                user.name = userInfo.name;
                user.email = userInfo.email;
                user.url = userInfo.html_url;
                user.contributions = contributor.contributions;
                user.hireable = userInfo.hireable;
                contributors.push(user);
              }

              i++;
              if(i == info.length){
                saveData(sourceJson, contributors);
              }
            }

            // Make user info request
            request(userOptions, userCallback);

          });
        });
      });
    }
    // If rate limit has been exceeded
    if(response.statusCode === 403) {
      console.log(color('✖ You\'ve exceeded github\'s API limit.', 'red+bold'),
        color('Try again in 5 or 10 minutes.', 'red+bold'));
    }
    // If request was successful
    if (!error && response.statusCode === 200) {
      var info = JSON.parse(body);
      var contributors = [];
      i=0;
      info.forEach(function(contributor){
        var contributions = 0;

        // User info request
        var userOptions = {
          url: contributor.url,
          headers: {
            'User-Agent': 'request'
          }
        };

        function userCallback(error, response, body) {
          if (!error && response.statusCode === 200) {
            var userInfo = JSON.parse(body);
            var user = new Object();
            user.name = userInfo.name;
            user.email = userInfo.email;
            user.url = userInfo.html_url;
            user.contributions = contributor.contributions;
            user.hireable = userInfo.hireable;
            contributors.push(user);
          }

          i++;
          if(i == info.length){
            saveData(sourceJson, contributors);
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
    // Save backup to .package.json
    fs.writeFile(dupJson, JSON.stringify(pack, null, 2), function(err) {
      if(err) {
        new Error(err);
      } else {
        console.log(color("✔", "green+bold"),
          "Saved a backup as",
          color(".package.json", "magenta"));
        status();
        writePackage();
      }
    });

    // Rewrite package.json
    // Fill the array with list from github
    pack.contributors = data;
    function writePackage() {
      fs.writeFile(file, JSON.stringify(pack, null, 2), function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log(color("✔", "green+bold"),
            "Contributors added to your",
            color("package.json", "magenta"),
            'from Github');

          // Markdown
          mkPerson = [
            '## Contributors',
            '##### [Generated](https://github.com/jakeleboeuf/contributor) on '+ new Date()
          ];
          yesno.ask('Save to contributors.md? (yes/no)', true, function(ok) {
            if(ok) {
              i=0;
              data.forEach(function(person){
                mkPerson.push('- ['+person.name+']('+person.url+')');
                if(i === (data.length)-1){
                  var markdown = mkPerson.sort()
                    .toString()
                    .split(",")
                    .join("\n");

                  console.log(color("✔", "green+bold"),
                    "Contributors added to your",
                    color("contributors.md", "magenta"),'as:');
                  console.log(color(markdown, "yellow"));
                  fs.writeFile('contributors.md', markdown, function(err) {
                    if(err) {
                      console.log(err);
                      status();
                      process.exit(code=1);
                      return;
                    } else {
                      status();
                      process.exit(code=0);
                      return;
                    }
                  });
                  return;
                }
                i++;
              });
            } else {
              status();
              process.exit(code=0);
              return;
            }
          }, ['yes'],['no']);
        }
      });
    }
    function status() {
      contributor.complete ++;
      if(contributor.complete === 2) {
        console.log(color("✔", "green+bold"), "All done");
      }
    }
  }
}
