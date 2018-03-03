const x = babelHelpers.wrapGenerator(function () {
  const request = coroutine.yield(1);
  coroutine.yield(request + ' from generator');
});
const g = x();
const response = g.next('message');
