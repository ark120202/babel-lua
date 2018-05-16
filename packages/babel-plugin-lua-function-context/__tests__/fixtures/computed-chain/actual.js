Promise.resolve(1)
  ['then'](() => Promise.resolve(2))
  ['then'](() => Promise.reject(3))
  ['catch'](() => Promise.resolve(4))
  .then(console.log);
