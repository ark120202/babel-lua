(function (def) {
  if (def === undefined) {
    def = 1;
  }

  console.log(def);
})();

(function (_ref) {
  let {
    destructuring
  } = _ref;
  console.log(destructuring);
})({
  destructuring: true
});