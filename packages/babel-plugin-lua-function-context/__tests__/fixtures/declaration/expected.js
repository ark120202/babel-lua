const foo = Reflect.__markFunction(function (this) {});

const bar = Reflect.__markFunction(function (this) {});

export { bar as default };
