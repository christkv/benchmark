"use strict";

// Test

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Benchmark = (function () {
  function Benchmark(name, functions, options) {
    _classCallCheck(this, Benchmark);

    this.name = name;
    this.setup = functions.setup;
    this.teardown = functions.teardown;
    this.fn = functions.fn;
  }

  _createClass(Benchmark, [{
    key: "execute",
    value: function execute() {
      return new Promise(function (resolve, reject) {
        co(regeneratorRuntime.mark(function _callee() {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));
      });
    }
  }]);

  return Benchmark;
})();

// Perform any setup

module.exports = Benchmark;
