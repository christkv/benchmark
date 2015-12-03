"use strict"

// Test
class Benchmark {
  constructor(name, functions, options) {
    this.name = name;
    this.setup = functions.setup;
    this.teardown = functions.teardown;
    this.fn = functions.fn;
  }

  execute() {
    return new Promise(function(resolve, reject) {
      co(function*() {
        // Perform any setup
      });
    });
  }
}

module.exports = Benchmark;
