"use strict"

var co = require('co'),
  f = require('util').format,
  Logger = require('../lib/logger'),
  assert = require('assert');

// Polyfill Promise if none exists
if(!global.Promise) {
  require('es6-promise').polyfill();
}

// Get babel polyfill
require("babel-polyfill");

describe('Benchmark', function() {
  describe('sync', function() {
    it('simple sync benchmark', function(done) {
      this.timeout(200000);

      co(function*() {
        var Benchmark = require('../').Benchmark;
        // var Sharded = require('../').Sharded;
        // // Create new instance
        // var topology = new Sharded('mongod');
        // // Perform discovery
        // var version = yield topology.discover();
        // // Expect 3 integers
        // assert.ok(typeof version.version[0] == 'number');
        // assert.ok(typeof version.version[1] == 'number');
        // assert.ok(typeof version.version[2] == 'number');
        // done();
      }).catch(function(err) {
        console.log(err.stack);
      });
    });
  });
});
