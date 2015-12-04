"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var co = require('co'),
    Stats = require('./stats'),
    EventEmitter = require('events');

// Test

var Benchmark = (function (_EventEmitter) {
  _inherits(Benchmark, _EventEmitter);

  function Benchmark(title, options) {
    _classCallCheck(this, Benchmark);

    // Benchmark title

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Benchmark).call(this));

    _this.title = title;

    // All the functions
    _this.fn = null;
    _this.fn_cycle_setup = [];
    _this.fn_cycle_teardown = [];
    _this.fn_start_setup = [];
    _this.fn_end_teardown = [];

    // Unpack the options
    _this.options = options || {};

    // We have a specific context
    _this.context = {};

    // Statistics
    _this.stats = [];
    _this.currentStats = null;
    return _this;
  }

  _createClass(Benchmark, [{
    key: 'reset',
    value: function reset() {
      // Reset the options for the benchmark
      this.context = Object.assign({}, this.originalContext);
      this.stats = [];
      this.currentStats = null;
    }
  }, {
    key: 'set',
    value: function set(fn) {
      var self = this;

      self.fn = function (isAsync) {
        return new Promise(function (resolve, reject) {
          co(regeneratorRuntime.mark(function _callee() {
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    if (!isAsync) {
                      _context.next = 2;
                      break;
                    }

                    return _context.abrupt('return', fn(self.context, function (err) {
                      if (err) return reject(err);
                      resolve();
                    }));

                  case 2:

                    // Are we running a sync operation
                    fn(self.context);
                    resolve();

                  case 4:
                  case 'end':
                    return _context.stop();
                }
              }
            }, _callee, this);
          })).catch(reject);
        });
      };

      return this;
    }
  }, {
    key: 'cycle',
    value: function cycle() {
      var self = this;

      return {
        setup: function setup(fn) {
          self.fn_cycle_setup.push(fn);
          return self;
        },
        teardown: function teardown(fn) {
          self.fn_cycle_teardown.push(fn);
          return self;
        }
      };
    }
  }, {
    key: 'setup',
    value: function setup(fn) {
      var self = this;

      this.fn_start_setup.push(function () {
        return new Promise(function (resolve, reject) {
          co(regeneratorRuntime.mark(function _callee2() {
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    fn(self.context, self.options, function (err) {
                      if (err) return reject(err);
                      resolve();
                    });

                  case 1:
                  case 'end':
                    return _context2.stop();
                }
              }
            }, _callee2, this);
          })).catch(reject);
        });
      });

      return this;
    }
  }, {
    key: 'teardown',
    value: function teardown(fn) {
      var self = this;

      this.fn_end_teardown.push(function () {
        return new Promise(function (resolve, reject) {
          co(regeneratorRuntime.mark(function _callee3() {
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    fn(self.context, self.stats, self.options, function (err) {
                      if (err) return reject(err);
                      resolve();
                    });

                  case 1:
                  case 'end':
                    return _context3.stop();
                }
              }
            }, _callee3, this);
          })).catch(reject);
        });
      });

      return this;
    }
  }, {
    key: 'execute',
    value: function execute(context, options) {
      var self = this;
      if (!this.fn) throw new Error('no benchmark function set');

      // Ensure we don't have null pointers
      context = context || {};
      options = options || {};

      // Merge the options together
      var finalOptions = Object.assign({}, options, self.options);

      // Unpack any options
      var warmup = finalOptions.warmup || 100;
      var cycles = finalOptions.cycles || 100;
      var iterations = finalOptions.iterations || 1000;
      var isAsync = typeof finalOptions.async == 'boolean' ? finalOptions.async : true;

      // Create a new context for the benchmark
      this.context = context ? Object.assign({}, context) : {};

      // Return execution promise for the benchmark
      return new Promise(function (resolve, reject) {
        co(regeneratorRuntime.mark(function _callee4() {
          var i, j;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  if (!(self.fn_start_setup.length > 0)) {
                    _context4.next = 8;
                    break;
                  }

                  i = 0;

                case 2:
                  if (!(i < self.fn_start_setup.length)) {
                    _context4.next = 8;
                    break;
                  }

                  _context4.next = 5;
                  return self.fn_start_setup[i]();

                case 5:
                  i++;
                  _context4.next = 2;
                  break;

                case 8:

                  // Emit setup
                  self.emit('setup', self);

                  //
                  // Warm up
                  //
                  // Do we need to perform some warm up iterations

                  if (!(warmup > 0)) {
                    _context4.next = 34;
                    break;
                  }

                  if (!(self.fn_cycle_setup.length > 0)) {
                    _context4.next = 18;
                    break;
                  }

                  i = 0;

                case 12:
                  if (!(i < self.fn_cycle_setup.length)) {
                    _context4.next = 18;
                    break;
                  }

                  _context4.next = 15;
                  return self.fn_cycle_setup[i]();

                case 15:
                  i++;
                  _context4.next = 12;
                  break;

                case 18:
                  i = 0;

                case 19:
                  if (!(i < warmup)) {
                    _context4.next = 25;
                    break;
                  }

                  _context4.next = 22;
                  return self.fn(isAsync);

                case 22:
                  i++;
                  _context4.next = 19;
                  break;

                case 25:
                  if (!(self.fn_cycle_teardown.length > 0)) {
                    _context4.next = 33;
                    break;
                  }

                  i = 0;

                case 27:
                  if (!(i < self.fn_cycle_teardown.length)) {
                    _context4.next = 33;
                    break;
                  }

                  _context4.next = 30;
                  return self.fn_cycle_teardown[i]();

                case 30:
                  i++;
                  _context4.next = 27;
                  break;

                case 33:

                  // Reset all stats
                  self.stats = [];

                case 34:
                  i = 0;

                case 35:
                  if (!(i < cycles)) {
                    _context4.next = 70;
                    break;
                  }

                  if (!(self.fn_cycle_setup.length > 0)) {
                    _context4.next = 44;
                    break;
                  }

                  j = 0;

                case 38:
                  if (!(j < self.fn_cycle_setup.length)) {
                    _context4.next = 44;
                    break;
                  }

                  _context4.next = 41;
                  return self.fn_cycle_setup[j]();

                case 41:
                  j++;
                  _context4.next = 38;
                  break;

                case 44:

                  // Current stats object
                  self.currentStats = new Stats();
                  self.currentStats.start();

                  // Execute all the iterations
                  j = 0;

                case 47:
                  if (!(j < iterations)) {
                    _context4.next = 56;
                    break;
                  }

                  self.currentStats.startIteration();
                  _context4.next = 51;
                  return self.fn(isAsync);

                case 51:
                  self.currentStats.endIteration();

                  // Finished iteration
                  self.emit('iteration', i, j, self);

                case 53:
                  j++;
                  _context4.next = 47;
                  break;

                case 56:

                  // Push the stats to the list of statistics objects for this benchmark
                  self.currentStats.end();
                  self.stats.push(self.currentStats);

                  // Perform the cycle teardown if we have one

                  if (!(self.fn_cycle_teardown.length > 0)) {
                    _context4.next = 66;
                    break;
                  }

                  j = 0;

                case 60:
                  if (!(j < self.fn_cycle_teardown.length)) {
                    _context4.next = 66;
                    break;
                  }

                  _context4.next = 63;
                  return self.fn_cycle_teardown[j]();

                case 63:
                  j++;
                  _context4.next = 60;
                  break;

                case 66:

                  // Emit the cycle
                  self.emit('cycle', i, self);

                case 67:
                  i++;
                  _context4.next = 35;
                  break;

                case 70:
                  if (!(self.fn_end_teardown.length > 0)) {
                    _context4.next = 78;
                    break;
                  }

                  i = 0;

                case 72:
                  if (!(i < self.fn_end_teardown.length)) {
                    _context4.next = 78;
                    break;
                  }

                  _context4.next = 75;
                  return self.fn_end_teardown[i]();

                case 75:
                  i++;
                  _context4.next = 72;
                  break;

                case 78:

                  // Emit execute event
                  self.emit('teardown', self);

                  // Resolve the benchmark execution
                  resolve();

                case 80:
                case 'end':
                  return _context4.stop();
              }
            }
          }, _callee4, this);
        })).catch(reject);
      });
    }
  }]);

  return Benchmark;
})(EventEmitter);

module.exports = Benchmark;
