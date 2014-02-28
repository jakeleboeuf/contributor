/*
 * penv.js: a package.json environment customizer
 *
 * (C) 2013 Julián Duque
 * MIT LICENCE
 *
 */
var async  = require('utile').async,
    utile  = require('utile'),
    eyes   = require('eyes'),
    path   = require('path'),
    fs     = require('fs');

//
// Penv Module + Defaults
//
var penv = module.exports = {
  pkgName: 'package.json',
  envName: 'environments.json',
  root:    process.cwd(),
  env:     'base'
};

//
// Helper Methods
//
penv.parseJSON = function (file, next) {
  var parsed;
  try { parsed = JSON.parse(file) }
  catch (err) { return next(err) }
  next(null, parsed);
}

//
// Flow
//
penv.start = function (next) {
  penv.config();
  async.parallel([
    penv.getPackage,
    penv.getEnvironment
  ], function (err, packages) {
    if (err) { return next(err) }
    penv.writePackage(packages, function (err) {
      next(err, penv.pkgFile);
    });
  });
}

penv.config = function (opts) {
  if (opts) { utile.mixin(penv, opts) }
  // add root path to file names
  penv.pkgFile = path.join(penv.root, penv.pkgName);
  penv.envFile = path.join(penv.root, penv.envName);
  penv.bkpFile = path.join(penv.root, '.' + penv.pkgName);
}

penv.getPackage = function (next) {
  fs.readFile(penv.bkpFile, 'utf-8', function (err, file) {
    if (!err) { return penv.parseJSON(file, next) }
    // Backup not found. Load package and save as backup
    fs.readFile(penv.pkgFile, 'utf-8', function (err, file) {
      if (err) { return next(err) }
      fs.rename(penv.pkgFile, penv.bkpFile, function (err) {
        // Dont hault execution. Just log error
        if (err) { return eyes.inspect(err) }
      });
      penv.parseJSON(file, next);
    });
  });
}

penv.getEnvironment = function (next) {
  fs.readFile(penv.envFile, 'utf-8', function (err, file) {
    if (err) { return next(err); }
    penv.parseJSON(file, function (err, parsed) {
      if (err) { return next(err) }
      if (penv.env == 'base') { return next(null, {}) }
      // Check that environment json has env property
      var envObj = parsed[penv.env];
      return envObj
        ? next(null, envObj)
        : next(new Error('error: '+ penv.envFile + ' does not contain property: ' + penv.env));
    });
  });
}

penv.writePackage = function (packages, next) {
  var merged = utile.mixin({}, packages[0], packages[1]);

  // Add env variable
  if (penv.env !== "base") {
    merged.env = {
      "NODE_ENV": penv.env
    };
  }

  fs.writeFile(penv.pkgFile, JSON.stringify(merged, null, 2), next);
}
