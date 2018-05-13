const x = Reflect.__wrapGenerator(function () {
  const request = Reflect.__yield(1);

  Reflect.__yield(request + ' from generator');
});

const g = x();
const response = g.next('message');
