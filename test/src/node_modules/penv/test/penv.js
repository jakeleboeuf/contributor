/*
 * penv.js test: tests for penv.js
 *
 * (C) 2013 Julián Duque
 * MIT LICENCE
 *
 */
var should = require('chai').should(),
    assert = require('chai').assert,
    rimraf = require('rimraf'),
    penv   = require('../lib/penv'),
    path   = require('path'),
    fs     = require('fs');

//
// Test Vars
//
var fixturesRoot = path.join(__dirname, 'fixtures'),
    testRoot = path.join(__dirname, 'root', 'app'),
    pkgName = 'package.json',
    bkpName = '.package.json',
    fixtures;

fixtures = {
  "staging": fs.readFileSync(path.join(fixturesRoot, 'package-staging.json'), 'utf8'),
  "base": fs.readFileSync(path.join(fixturesRoot, 'package-base.json'), 'utf8')
};

//
// Helper Methods
//
function beginExec(env) {
  it('should exist', function () {
    should.exist(penv.start);
  });
  before(function (next) {
    penv.config({
        root: testRoot,
        env: env
    });
    penv.start(function (err) {
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

function checkFixtureMatch(str, fileName, matchFile) {
  it(str, function () {
    var file = fs.readFileSync(path.join(testRoot, fileName), 'utf8');
    assert.deepEqual(JSON.parse(matchFile), JSON.parse(file));
  });
}

//
// Tests
//
describe('Penv', function () {
  describe('#start() first: create backup', function () {
    beginExec('staging');
    checkFileExist('backup package should exist', bkpName);
    checkFixtureMatch('package.json should be modified', pkgName, fixtures.staging);
  });
  describe('#start() second: use backup', function () {
    beginExec('base');
    checkFixtureMatch('package.json should be reset', pkgName, fixtures.base);
    after(function (next) {
      rimraf(path.join(testRoot, '.package.json'), next)
    });
  });
});
