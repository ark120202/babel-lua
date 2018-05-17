(() => {
  const _returns = Reflect.__try(() => {
    throw new Error();
  }, () => {
    return 'not returned';
  }, () => {
    return 'returned';
  });

  if (_returns === Reflect.TryNil) {
    return _returns;
  } else if (_returns != null) {
    return _returns;
  }

  return 'not returned';
})();
