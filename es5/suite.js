"use strict";

// Benchmark Suite

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Suite = (function (_EventEmitter) {
  _inherits(Suite, _EventEmitter);

  function Suite(name, options) {
    _classCallCheck(this, Suite);

    // No options passed in fallback to sensible defaults

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Suite).call(this));

    _this.options = options || { warmup: 100, cycles: 10, iterations: 1000 };
    // The benchmarks
    _this.benchmarks = [];
    // The context of the suite
    _this.context = {};
    return _this;
  }

  _createClass(Suite, [{
    key: 'addTest',
    value: function addTest(title, fn, options) {
      var benchmark = new Benchmark(title, {
        setup: typeof fn.setup == 'function' ? fn.setup : function (done) {
          done();
        },
        teardown: typeof fn.teardown == 'function' ? fn.teardown : function (done) {
          done();
        },
        fn: typeof fn.fn == 'function' ? fn.fn : function (done) {
          done();
        }
      }, Object.assign({}, this.options, options));

      // Add the benchmark to the list of all benchmarks
      this.benchmarks.push(benchmark);
    }
  }, {
    key: 'setup',
    value: function setup(fn) {
      this.fn_setup = new Promise(function (resolve, reject) {
        co(regeneratorRuntime.mark(function _callee() {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  fn(this.context, function (err) {
                    if (err) return reject(err);
                    resolve();
                  });

                case 1:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, this);
        })).catch(reject);
      });
    }
  }, {
    key: 'teardown',
    value: function teardown(fn) {
      this.fn_teardown = new Promise(function (resolve, reject) {
        co(regeneratorRuntime.mark(function _callee2() {
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  fn(this.context, function (err) {
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
    }
  }, {
    key: 'execute',
    value: function execute() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var self = _this2;

        co(regeneratorRuntime.mark(function _callee3() {
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  if (!(typeof self.fn_setup == 'function')) {
                    _context3.next = 3;
                    break;
                  }

                  _context3.next = 3;
                  return self.fn_setup();

                case 3:
                  if (!(typeof self.fn_teardown == 'function')) {
                    _context3.next = 6;
                    break;
                  }

                  _context3.next = 6;
                  return self.fn_teardown();

                case 6:
                case 'end':
                  return _context3.stop();
              }
            }
          }, _callee3, this);
        }));
      });
    }
  }]);

  return Suite;
})(EventEmitter);

module.exports = Suite;
