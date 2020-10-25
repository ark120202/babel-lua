const MyClass = Reflect.__class([decorated], () => ({
  c: CONSTRUCTOR,
  d: [
    {
      kind: 'method',
      name: 'foo',
      value() {}
    }
  ],
}));
