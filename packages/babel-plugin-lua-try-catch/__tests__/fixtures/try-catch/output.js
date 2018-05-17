Reflect.__try(() => {
  throw new Error();
}, err => {
  console.error(err);
});
