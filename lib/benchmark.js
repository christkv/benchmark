"use strict"

var co = require('co'),
  Stats = require('./stats'),
  EventEmitter = require('events');

// Test
class Benchmark {
  constructor(name, options) {
    this.name = name;

    // All the functions
    this.fn = null;
    this.fn_cycle_setup = [];
    this.fn_cycle_teardown = [];
    this.fn_start_setup = [];
    this.fn_end_teardown = [];

    // Unpack the options
    this.options = options || { warmup: 100, cycles: 10, iterations: 1000, context: {}, async: true };

    // Ensure we have a warmup, cycles, iterations and context
    if(!this.options.warmup) this.options.warmup = 100;
    if(!this.options.cycles) this.options.cycles = 100;
    if(!this.options.iterations) this.options.iterations = 100;
    if(typeof this.options.async != 'boolean') this.options.async = true;

    // Save the context
    this.context = this.options.context ? this.options.context : {};

    // Statistics
    this.stats = [];
    this.currentStats = null;
  }

  set(fn) {
    var self = this;

    self.fn = function() {
      return new Promise((resolve, reject) => {
        co(function*() {
          // Are we running an async operation
          if(self.options.async) {
            return fn(self.context, function(err) {
              if(err) return reject(err);
              resolve();
            });
          }

          // Are we running a sync operation
          fn(self.context);
          resolve();
        }).catch(reject);
      });
    }

    return this;
  }

  cycle() {
    var self = this;

    return {
      setup(fn) {
        self.fn_cycle_setup.push(function() {
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
        self.fn_cycle_teardown.push(function() {
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
    var self = this;

    this.fn_start_setup.push(function() {
      return new Promise((resolve, reject) => {
        co(function*() {
          fn(self.context, self.options, function(err) {
            if(err) return reject(err);
            resolve();
          });
        }).catch(reject);
      });
    });

    return this;
  }

  teardown(fn) {
    var self = this;

    this.fn_end_teardown.push(function() {
      return new Promise((resolve, reject) => {
        co(function*() {
          fn(self.context, self.stats, self.options, function(err) {
            if(err) return reject(err);
            resolve();
          });
        }).catch(reject);
      });
    });

    return this;
  }

  execute() {
    var self = this;
    if(!this.fn) throw new Error('no benchmark function set');

    // Return execution promise for the benchmark
    return new Promise(function(resolve, reject) {
      co(function*() {
        // console.log("--------------------- 0")
        // Perform any setup needed
        if(self.fn_start_setup.length > 0) {
          for(var i = 0; i < self.fn_start_setup.length; i++) {
            yield self.fn_start_setup[i]();
          }
        }
        // console.log("--------------------- 1")

        //
        // Warm up
        //
        // Do we need to perform some warm up iterations
        if(self.options.warmup > 0) {
          // Perform the cycle setup if we have one
          // if(self.fn_cycle_setup) yield self.fn_cycle_setup();
          if(self.fn_cycle_setup.length > 0) {
            for(var i = 0; i < self.fn_cycle_setup.length; i++) {
              yield self.fn_cycle_setup[i]();
            }
          }

          // For the number of cycles
          for(var i = 0; i < self.options.warmup; i++) yield self.fn();
          // Perform the cycle teardown if we have one
          // if(self.fn_cycle_teardown) yield self.fn_cycle_teardown();
          if(self.fn_cycle_teardown.length > 0) {
            for(var i = 0; i < self.fn_cycle_teardown.length; i++) {
              yield self.fn_cycle_teardown[i]();
            }
          }

          // Reset all stats
          self.stats = [];
        }

        //
        // Execute benchmark for x number of cycles y number of iterations
        //
        for(var i = 0; i < self.options.cycles; i++) {
          // console.log("---------- cycle " + i)
          // Perform the cycle setup if we have one
          // if(self.fn_cycle_setup) yield self.fn_cycle_setup();
          if(self.fn_cycle_setup.length > 0) {
            for(var j = 0; j < self.fn_cycle_setup.length; j++) {
              yield self.fn_cycle_setup[j]();
            }
          }

          // Current stats object
          self.currentStats = new Stats();
          self.currentStats.start();

          // Execute all the iterations
          for(var j = 0; j < self.options.iterations; j++) {
            self.currentStats.startIteration();
            yield self.fn();
            self.currentStats.endIteration();
          }

          // Push the stats to the list of statistics objects for this benchmark
          self.currentStats.end();
          self.stats.push(self.currentStats);

          // Perform the cycle teardown if we have one
          // if(self.fn_cycle_teardown) yield self.fn_cycle_teardown();
          if(self.fn_cycle_teardown.length > 0) {
            for(var j = 0; j < self.fn_cycle_teardown.length; j++) {
              yield self.fn_cycle_teardown[j]();
            }
          }
        }

        // Perform any teardown needed
        // if(self.fn_end_teardown) yield self.fn_end_teardown();
        if(self.fn_end_teardown.length > 0) {
          for(var i = 0; i < self.fn_end_teardown.length; i++) {
            yield self.fn_end_teardown[i]();
          }
        }
        // Resolve the benchmark execution
        resolve();
      }).catch(reject);
    });
  }
}

module.exports = Benchmark;
