function _new(c, ...args) { const proto = c.prototype; const obj = {}; for (var k in proto) { obj[k] = proto[k]; } return c(obj, ...args); }

_new(Class);

_new(Class);

_new(Class, arg);
