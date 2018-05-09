const foo = babelHelpers.markFunction(function (this) {
  this.bar();
});
const foo = babelHelpers.markFunction(function (this, a) {
  return a;
});
const foo = babelHelpers.markFunction(function (_, a) {
  return a;
});
const map = {
  foo: babelHelpers.markFunction(function (_2, a) {
    return a;
  })
};
