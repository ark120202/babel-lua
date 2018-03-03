export default function _wrapGenerator(f) {
  return function() {
    const c = coroutine.create(f);
    return {
      next(arg) {
        __lua('local status, value = coroutine.resume(c, arg)')
        if (!status) {
          return { done: true }
        } else {
          return { value, done: coroutine.status(c) === 'dead' };
        }
      },
      throw: () => { throw 'generator.throw is not supported'; },
      'return': () => { throw 'generator.return is not supported'; },
    }
  };
}
