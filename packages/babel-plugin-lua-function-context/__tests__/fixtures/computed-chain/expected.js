Reflect.__computed(Reflect.__computed(Reflect.__computed(Promise.resolve(1), 'then', Reflect.__markFunction(function () {
  return Promise.resolve(2);
})), 'then', Reflect.__markFunction(function () {
  return Promise.reject(3);
})), 'catch', Reflect.__markFunction(function () {
  return Promise.resolve(4);
})).then(console.log);
