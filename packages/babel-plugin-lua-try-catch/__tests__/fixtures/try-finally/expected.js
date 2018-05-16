Reflect.__try(() => {
  throw new Error();
}, null, () => {
  console.log('finally');
});
