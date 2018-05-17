Reflect.__try(() => {
  throw new Error();
}, () => {
  console.log('Error');
});
