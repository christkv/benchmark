"use strict"

var co = require('co'),
  EventEmitter = require('events');

// Benchmark Suite
class Suite extends EventEmitter {
  constructor(name, options) {
    super();

    // Unpack the options
    this.options = options || { warmup: 100, cycles: 10, iterations: 1000, context: {}, async: true };

    // Ensure we have a warmup, cycles, iterations and context
    if(!this.options.warmup) this.options.warmup = 100;
    if(!this.options.cycles) this.options.cycles = 100;
    if(!this.options.iterations) this.options.iterations = 100;
    if(typeof this.options.async != 'boolean') this.options.async = true;

    // Save the context
    this.context = this.options.context ? this.options.context : {};

    // The benchmarks
    this.benchmarks = [];

    // Settings for suite
    this.fn_start_setup = [];
    this.fn_end_teardown = [];

    // Settings for benchmark
    this.fn_benchmark_setup = [];
    this.fn_benchmark_teardown = [];
  }

  addTest(benchmark) {
    // Push the benchmark to the list of benchmarks
    this.benchmarks.push(benchmark);
    // Return the suite to be able to perform chaining
    return this;
  }

  benchmark() {
    var self = this;

    return {
      setup(fn) {
        self.fn_benchmark_setup.push(function() {
          return new Promise((resolve, reject) => {
            co(function*() {
              fn(self.context, self.options, function(err) {
                if(err) return reject(err);
                resolve();
              });
            }).catch(reject);
          });
        });

        return self;
      },

      teardown(fn) {
        self.fn_benchmark_teardown.push(function() {
          return new Promise((resolve, reject) => {
            co(function*() {
              fn(self.context, self.options, function(err) {
                if(err) return reject(err);
                resolve();
              });
            }).catch(reject);
          });
        });

        return self;
      }
    }
  }

  setup(fn) {
    this.fn_start_setup = new Promise((resolve, reject) => {
      co(function*() {
        fn(this.context, function(err) {
          if(err) return reject(err);
          resolve();
        });
      }).catch(reject);
    });
  }

  teardown(fn) {
    this.fn_end_teardown = new Promise((resolve, reject) => {
      co(function*() {
        fn(this.context, function(err) {
          if(err) return reject(err);
          resolve();
        });
      }).catch(reject);
    });
  }

  execute() {
    return new Promise((resolve, reject) => {
      var self = this;

      co(function*() {
        // Perform any setup needed
        if(self.fn_start_setup.length > 0) {
          for(var i = 0; i < self.fn_start_setup.length; i++) {
            yield self.fn_start_setup[i]();
          }
        }

        // // Perform any teardown needed
        // if(typeof self.fn_teardown == 'function') {
        //   yield self.fn_teardown();
        // }

        // Perform any setup needed
        if(self.fn_end_teardown.length > 0) {
          for(var i = 0; i < self.fn_end_teardown.length; i++) {
            yield self.fn_end_teardown[i]();
          }
        }

        // Finish up
        resolve();
      });
    });
  }
}

module.exports = Suite;
