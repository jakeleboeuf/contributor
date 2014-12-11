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
  totalCommits: 0,
  totalCommitsArray: [],
  username: contribApi[3],
  password: null,
  repo: contribApi[4].replace('.git', '')
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
      '/stats/contributors',
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
          if (err) {
            console.log(
              color('✖ Error:', 'red+bold'),
              color(JSON.parse(err.message).message, 'magenta')
            );
            console.log(
              color('Read more at', 'yellow+bold'),
              color(JSON.parse(err.message).documentation_url, 'yellow')
            );
            return;
          }
          info = res;
          var contributors = [];
          i=0;
          info.forEach(function(contributorObj){
            var additions = 'na', deletions = 'na', contributions = parseInt(contributorObj.contributions);
            contributor.totalCommits += contributions;

            // User info request
            var userOptions = {
              url: contributorObj.url,
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
                user.contributions = contributions;
                user.additions = additions;
                user.deletions = deletions;
                user.hireable = userInfo.hireable;
                contributors.push(user);
              } else {
                console.log('something went wrong:', response);
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
      // Expires at
      var now = new Date();
      var expires = response["X-RateLimit-Reset"];
      var expiresAt = new Date(parseInt(response.headers["x-ratelimit-reset"])*1000);
      console.log(color('✖ You\'ve exceeded github\'s API limit.', 'red+bold'));
      console.log(color('Try again at ' + expiresAt.getHours() + ':' + (expiresAt.getMinutes()<10?'0':'') + expiresAt.getMinutes() + '.', 'red+magenta'));
      process.exit(code=1);
    }
    // If request was successful
    if (!error && response.statusCode === 200) {
      var info = JSON.parse(body);
      var contributors = [];
      i=0;

      // Get all the addition/Deletion info
      info.forEach(function(contributorI){
        var additions = 0, deletions = 0, contributions = contributorI.total;
        // Keep an eye on total project contributions
        contributor.totalCommits += contributorI.total;
        // Loop thru weeks and add up all addition/deletions
        contributorI.weeks.forEach(function(week){
          additions += week.a;
          deletions += week.d;
        });
        // User info request
        var userOptions = {
          url: contributorI.author.url,
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
            user.contributions = contributions;
            user.additions = additions;
            user.deletions = deletions;
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
          var mkDwn = [
            '###### Contributors'
          ];
          mkPerson = [];
          yesno.ask('Save to contributors.md? (yes/no)', true, function(ok) {
            if(ok) {
              i=0;
              data.forEach(function(person){
                // Create an object to represent each person
                var thisPerson = {
                  "commits": 0,
                  "markdown": []
                }

                // Set up some stuffs for Markdown formatting
                var percentage = person.contributions/contributor.totalCommits;
                var percentageFill = Array(Math.ceil(percentage * 182)).join("|"); // ->||||<-||||||||||||
                var percentageEmpty = Array(Math.ceil(182 - Math.ceil(percentage * 182))).join("|"); // ||||->||||||||||||<-
                var percentageDisplay = ((percentage * 100).toFixed(2)<10) ? ("0" + (percentage * 100).toFixed(2)) : (percentage * 100).toFixed(2);

                // Drop stuff in arrays and objects and sort them and then poop
                thisPerson.commits = person.contributions;
                thisPerson.markdown.push('['+person.name+']('+person.url+')');
                thisPerson.markdown.push('<font color="#999">'+person.contributions+' Commits</font> / <font color="#6cc644">'+person.additions+'++</font> / <font color="#bd3c00"> '+person.deletions+'--</font>');
                thisPerson.markdown.push('<font color="#dedede">'+percentageDisplay+'%&nbsp;<font color="#dedede">'+percentageFill+'</font><font color="#f4f4f4">'+percentageEmpty+'</font><br><br>');
                mkPerson.push(thisPerson);
                if(i === (data.length)-1){
                  // Function to handle object sorting
                  // Sort by most commits
                  mkPerson.sort(function(a,b) {
                    if (a.commits < b.commits) {
                      return 1;
                    } else {
                      return -1;
                    }
                    return 0;
                  });
                  mkPerson.forEach(function(obj){
                    mkDwn.push(obj.markdown);
                  });
                  mkDwn.push('###### [Generated](https://github.com/jakeleboeuf/contributor) on '+ new Date());
                  thisPerson.markdown.toString();
                  var markdown = mkDwn.toString().split(",").join("\n");

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
