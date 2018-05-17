function foo() {
  this.bar();
}

const foo = function(a) {
  return a;
};
const foo = a => a;
const foo = () => {};
const map = {
  foo: a => a,
};
