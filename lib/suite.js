"use strict"

// Benchmark Suite
class Suite extends EventEmitter {
  constructor(name, options) {
    super();
    // No options passed in fallback to sensible defaults
    this.options = options || { warmup: 100, cycles: 10, iterations: 1000 };
    // The benchmarks
    this.benchmarks = [];
    // The context of the suite
    this.context = {};
  }

  addTest(title, fn , options) {
    var benchmark = new Benchmark(title, {
      setup: typeof fn.setup == 'function'
        ? fn.setup : function(done) { done(); },
      teardown: typeof fn.teardown == 'function'
        ? fn.teardown : function(done) { done(); },
      fn: typeof fn.fn == 'function'
        ? fn.fn : function(done) { done(); },
    }, Object.assign({}, this.options, options));

    // Add the benchmark to the list of all benchmarks
    this.benchmarks.push(benchmark);
  }

  setup(fn) {
    this.fn_setup = new Promise((resolve, reject) => {
      co(function*() {
        fn(this.context, function(err) {
          if(err) return reject(err);
          resolve();
        });
      }).catch(reject);
    });
  }

  teardown(fn) {
    this.fn_teardown = new Promise((resolve, reject) => {
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
        if(typeof self.fn_setup == 'function') {
          yield self.fn_setup();
        }



        // Perform any teardown needed
        if(typeof self.fn_teardown == 'function') {
          yield self.fn_teardown();
        }
      });
    });
  }
}

module.exports = Suite;
