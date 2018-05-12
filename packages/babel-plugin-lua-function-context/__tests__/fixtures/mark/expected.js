const foo = Reflect.__markFunction(function (this) {
  this.bar();
});

const foo = Reflect.__markFunction(function (this, a) {
  return a;
});

const foo = Reflect.__markFunction(function (_, a) {
  return a;
});

const map = {
  foo: Reflect.__markFunction(function (_2, a) {
    return a;
  })
};
