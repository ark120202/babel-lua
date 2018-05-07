function foo() {
  this.bar();
}

function foo(a) {
  return a;
}
const foo = function(a) {
  return a;
};
const foo = a => a;
const map = {
  foo: a => a,
};
