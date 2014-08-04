/*
 * contributor.js test: tests for contributor.js
 *
 * (C) 2014 Jake LeBoeuf
 * MIT LICENCE
 *
 */
var should = require('chai').should(),
    assert      = require('chai').assert,
    rimraf      = require('rimraf'),
    contributor = require('../lib/contributor'),
    path        = require('path'),
    fs          = require('fs');

//
// Test Vars
//
var testRoot = path.join(__dirname, 'root', 'app'),
    pkgName = 'package.json',
    bkpName = '.package.json'

//
// Helper Methods
//
function beginExec() {
  it('should exist', function () {
    should.exist(contributor.start);
  });
  before(function (next) {
    contributor.start(function (err) {
      assert.ok(!err);
      next();
    });
  });
}

function checkFileExist(str, fileName) {
  it(str, function () {
    var file = fs.readFileSync(path.join(testRoot, fileName), 'utf8');
    should.exist(file);
  });
}

//
// Tests
//
describe('contributor', function () {
  describe('#start() first: create backup', function () {
    checkFileExist('Original package should exist', pkgName);
    beginExec();
  });
  describe('#start() second: use backup', function () {
    after(function (next) {
      rimraf(path.join(testRoot, '.package.json'), next)
      checkFileExist('backup package should exist', bkpName);
    });
  });
});
