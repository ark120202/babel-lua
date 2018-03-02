function* x() {
  const request = yield 1;
  yield request + ' from generator';
}

const g = x();
const response = g.next('message');
