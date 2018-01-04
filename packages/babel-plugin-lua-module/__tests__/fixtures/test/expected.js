var module = { exports: {} },
    exports = module.exports;
exports.foo = 'bar';
module.exports.bar = 'foo';
return module.exports;