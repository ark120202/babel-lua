const x = Reflect.__wrapGenerator(function () {
  const request = coroutine.yield(1);
  coroutine.yield(request + ' from generator');
});

const g = x();
const response = g.next('message');
