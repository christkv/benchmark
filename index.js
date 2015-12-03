// Polyfill Promise if none exists
if(!global.Promise) {
  require('es6-promise').polyfill();
}

// Check if we support es6 generators
try {
  eval("(function *(){})");

  // Expose all the managers
  var Benchmark = require('./lib/benchmark');
  var Suite = require('./lib/suite');
} catch(err) {
  // Load the ES6 polyfills
  require("babel-polyfill");

  // Load ES5 versions of our managers
  var Benchmark = require('./es5/benchmark');
  var Suite = require('./es5/suite');
}

// Export all the modules
module.exports = {
  Benchmark: Benchmark,
  Suite: Suite
}
