/* eslint max-len: "off" */

import template from '@babel/template';

const helpers = {};
export default helpers;

// Helpers never include placeholders, so we disable placeholder pattern
// matching to allow us to use pattern-like variable names.
const defineHelper = template.program({ placeholderPattern: false });

helpers.iif = defineHelper(`
  export default function iif(condition, t, f) {
    if (condition) {
      return type(t) == 'function' && t() || t
    } else {
      return type(f) == 'function' && f() || f
    }
  }
`);

helpers.typeof = defineHelper(`
  export default function _typeof(obj) {
    const ot = type(obj)
    return ot === "table" ? "object" : ot;
  }
`);

helpers.wrapGenerator = defineHelper(`
  export default function _wrapGenerator(f) {
    return function(...args) {
      const c = coroutine.create(f, ...args);
      return {
        next: function(arg) {
          const x = [coroutine.resume(c, arg)];
          const status = x[1], value = x[2];
          if (!status) {
            return { done: true }
          } else {
            return { value: value, done: coroutine.status(c) === 'dead' };
          }
        },
        throw: function() { throw 'generator.throw is not supported'; },
        'return': function() { throw 'generator.return is not supported'; },
      }
    };
  }
`);

helpers.new = defineHelper(`
  export default function _new(c, ...args) {
    const proto = c.prototype;
    const obj = {};

    for (var k in proto) {
      obj[k] = proto[k];
    }

    return c(obj, ...args);
  }
`);
