#Contributor [![Build Status](https://travis-ci.org/jakeleboeuf/contributor.png)](https://travis-ci.org/jakeleboeuf/contributor) [![GitHub version](https://badge.fury.io/gh/jakeleboeuf%2Fcontributor.png)](http://badge.fury.io/gh/jakeleboeuf%2Fcontributor)
A simple [node](http://nodejs.org) module to grab your project contributors from your github repo and add them to your package.json. You'll also be prompted to generate a Markdown version of your contributors list and save it to `contributors.md`.

  

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

As of [v0.1.12](https://github.com/jakeleboeuf/contributor/releases/tag/v0.1.12), you'll be prompted to optionally `Save to contributors.md? (yes/no)`.

![Prompt](https://raw.github.com/jakeleboeuf/contributor/master/img/mdPrompt.png)


### contributors.md Preview

It should look all spiffy, but unfortunaly I realized after pushing this that github does not support custom text colors and neato things. lame. I'll fix it someday.

<br>
***Screenshot of intended Markdown***

![Preview](https://raw.github.com/jakeleboeuf/contributor/master/img/preview.png)


### Behind the scenes

[Contributor](https://www.npmjs.org/package/contributor) hunts for repository.url in your your `package.json`. If it finds a valid repo url, it requests collaborator info from the github api and adds it to your `package.json`. Super simple. If your repo is private, you'll be prompted for your Github username/password.

`$ contributor` will always make a backup of your original json to `.package.json`, so all your secret codes are safe.


#### Pro tip: Add a git push alias and kill a couple birds.

	$ git config alias.pushc \!git push $1 $2 && contributor
  
This will simply add the pushc alias to your .git/config file like so:

	[alias]
    	pushc = !git push $1 $2 && contributor
    
Then you can run `git pushc origin master`, and voila! Give it a try on your next project and let me know what you think!

--
###Examle output


package.json **Before** `$ contributor`:


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

package.json **After** `$ contributor`:

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

[![NPM](https://nodei.co/npm/contributor.png)](https://nodei.co/npm/contributor/) 