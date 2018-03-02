function _wrapGenerator(f) { return function (...args) { const c = coroutine.create(f, ...args); return { next: function (arg) { const x = [coroutine.resume(c, arg)]; const status = x[1], value = x[2]; if (!status) { return { done: true }; } else { return { value: value, done: coroutine.status(c) === 'dead' }; } }, throw: function () { throw 'generator.throw is not supported'; }, 'return': function () { throw 'generator.return is not supported'; } }; }; }

const x = _wrapGenerator(function () {
  const request = coroutine.yield(1);
  coroutine.yield(request + ' from generator');
});

const g = x();
const response = g.next('message');
