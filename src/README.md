#Contributor [![Build Status](https://travis-ci.org/jakeleboeuf/contributor.png)](https://travis-ci.org/jakeleboeuf/contributor)

A simple [node](http://nodejs.org) module to add git contributors to your package.json. Private repos are available as of 0.1.6!

[![NPM](https://nodei.co/npm/contributor.png)](https://nodei.co/npm/contributor/)
  
## Install from [npm](https://www.npmjs.org/package/contributor)

    $ npm install contributor -g

or add it as one of your projects `package.json` dependencies like this:
  
  
```json
{
  ...
  "dependencies": {
    "contributor": "0.1.x"
  }
}
```

## Usage

To get a record of your project's contribution info from your github repo, `cd` into the directory containing your `package.json` and run:
  
	$ contributor

Bingo! Your `package.json` will be appended with something like this:

```json
{
  ...
  "contributors": [
    {
      "name": "Jake LeBoeuf",
      "email": "dev@jakeleboeuf.com",
      "url": "https://github.com/jakeleboeuf",
      "contributions": 20,
      "hireable": true
    }
  ]
}
```

### Behind the scenes

[Contributor](https://www.npmjs.org/package/contributor) hunts for repository.url in your your `package.json`. If it finds a valid repo url, it requests collaborator info from the github api and adds it to your `package.json`. Super simple.

It will make a backup of your original json to `.package.json`, so all your secret codes are safe.


#### Pro tip: Add a git push alias and kill a couple birds.

	$ git config alias.pushc \!git push $1 $2 && contributor
  
This will simply add the pushc alias to your .git/config file like so:

	[alias]
    	pushc = !git push $1 $2 && contributor
    
Then you can run `git pushc origin master`, and voila! Give it a try on your next project and let me know what you think!

--
###Examle output


Before `contributor`:


```json
{
  "author": "Jake LeBoeuf",
  "name": "contributor",
  "description": "Example package.json.",
  "version": "0.1.1",
  "homepage": "https://github.com/jakeleboeuf/contributor",
  "repository": {
    "type": "git",
    "url": "https://github.com/jakeleboeuf/contributor.git"
  },
  "bugs": {
    "url": "https://github.com/jakeleboeuf/contributor/issues"
  },
  "engines": {
    "node": "0.10.x",
    "npm": "1.4.x"
  },
  "dependencies": {
    "request": "2.34.x",
    "ansi-color": "0.2.x",
    "github": "0.1.x",
    "prompt": "0.2.x"
  }
}
```

After `contributor`:

```json
{
  "author": "Jake LeBoeuf",
  "name": "contributor",
  "description": "Example package.json.",
  "version": "0.1.1",
  "homepage": "https://github.com/jakeleboeuf/contributor",
  "repository": {
    "type": "git",
    "url": "https://github.com/jakeleboeuf/contributor.git"
  },
  "bugs": {
    "url": "https://github.com/jakeleboeuf/contributor/issues"
  },
  "engines": {
    "node": "0.10.x",
    "npm": "1.4.x"
  },
  "dependencies": {
    "request": "2.34.x",
    "ansi-color": "0.2.x",
    "github": "0.1.x",
    "prompt": "0.2.x"
  },
  "contributors": [
    {
      "name": "Jake LeBoeuf",
      "email": "dev@jakeleboeuf.com",
      "url": "https://github.com/jakeleboeuf",
      "contributions": 20,
      "hireable": true
    }
  ]
}
```
[![Support via Gittip](https://rawgithub.com/twolfson/gittip-badge/0.2.0/dist/gittip.png)](https://www.gittip.com/jakeleboeuf/)
