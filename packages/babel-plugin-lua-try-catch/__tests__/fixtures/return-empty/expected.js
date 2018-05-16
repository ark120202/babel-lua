(() => {
  const _returns = Reflect.__try(() => {
    throw new Error();
  }, () => {
    return Reflect.TryNil;
  });

  if (_returns === Reflect.TryNil) {
    return _returns;
  } else if (_returns != null) {
    return _returns;
  }

  console.log('unreachable code');
})();
