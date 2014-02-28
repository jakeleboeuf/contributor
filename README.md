#Contributor [![Build Status](https://travis-ci.org/jakeleboeuf/contributor.png)](https://travis-ci.org/jakeleboeuf/contributor)

A simple module to add git contributors to your package.json.

## Install from [npm](https://www.npmjs.org/package/contributor)

    $ npm install contributor


## Run

To grab contributor info from your github repo, `cd` into the directory containing your `package.json` and run:
	
	$ contributor

Bingo!

### Behind the scenes

[Contributor](http://labs.jklb.co/contributor) checks your `package.json` for your github repo, then requests collaborator info from the github api and adds it to your `package.json`. Super simple.

It will make a backup your original to .package.json so all your secret codes are safe.


#### Pro tip: Add a git push alias and kill a couple birds.
	$ git config alias.pushc \!git push $1 $2 && node contributor
	
This will simply add the pushc alias to your .git/config file like so:

	[alias]
	  pushc = !git push $1 $2 && contributor
	  
Then you can run `git pushc origin master`, and voila! Give it a try on your next project and let me know what you think!
