const Function = require('./builtins/function');
const functionCache = {};
debug.setmetatable(function() {}, {
  __index(index) {
    if (functionCache[this] == null || functionCache[this][index] == null) {
      return Function.prototype[index];
    } else {
      return functionCache[this][index];
    }
  },

  __newindex(k, v) {
    if (functionCache[this] == null) functionCache[this] = {};
    functionCache[this][k] = v;
  },
});

const String = require('./builtins/string');
debug.setmetatable('', {
  __add(str) {
    // TODO: Implement __lua macros
    return __lua('this .. str');
  },
  __index(index) {
    return String.prototype[index];
  },
  __newindex: () => {},
});
