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
