<p align="center">
  <a href="https://github.com/ark120202/babel-lua">
    <img alt="Babel Lua" src="https://raw.githubusercontent.com/ark120202/babel-lua/master/logo.png" height="225">
  </a>
</p>

<p align="center">
  <b>JavaScript to Lua compiler powered by Babel.</b>
</p>

<p align="center">
  <a href="https://travis-ci.org/ark120202/babel-lua">
    <img alt="Travis Status" src="https://img.shields.io/travis/ark120202/babel-lua/master.svg?label=travis&maxAge=43200">
  </a>
  <a href="https://codecov.io/github/ark120202/babel-lua">
    <img alt="Coverage Status" src="https://img.shields.io/codecov/c/github/ark120202/babel-lua/master.svg?maxAge=43200">
  </a>
  <a href="https://www.npmjs.com/package/babel-lua-preset">
    <img alt="npm Downloads" src="https://img.shields.io/npm/dm/babel-lua-preset.svg?maxAge=43200">
  </a>
</p>

---

## Installation

> **WARNING**: Babel Lua is still under development.
> Until first stable release, any update may contain breaking changes.

1. Get latest `babel-lua-preset` from npm

```bash
yarn add -D @babel/core babel-lua-preset
# or
npm install -D @babel/core babel-lua-preset
```

2. Modify your Babel config to use `babel-lua-preset`.

```json
{
  "presets": ["babel-lua-preset"]
}
```

babel-lua-preset is based on babel-preset-es2015.

babel-lua-preset is incompatible with babel-preset-env, so to use next ES versions, you have to use babel-preset-es\*\*\*\*

3. Add `babel-lua-runtime` to your environment

> Keep in mind that by default (with LUA_PATH "?;?.lua") Lua loads modules relative to your work directory, so you can't place babel-lua-runtime to subdirectory.

* Without npm:

1. Get babel-lua-runtime files from [repository](https://github.com/ark120202/babel-lua/tree/master/packages/babel-lua-runtime/babel-lua-runtime).

2. Put them to your Lua root.

* With npm:

1. Get latest babel-lua-runtime from npm.

```bash
yarn add -D babel-lua-runtime
# or
npm install -D babel-lua-runtime
```

2. Use it in your build provider.

It's recommended to execute it on each build, so runtime in your project will match npm version.

```js
const fs = require('fs-extra');
const runtime = require('babel-lua-runtime');

fs.copySync(runtime.directory, './your/lua/work/directory');
```

```js
const gulp = require('gulp');
const runtime = require('babel-lua-runtime');

gulp.task('babel-lua', () => gulp.src(runtime.glob).pipe(gulp.dest('./your/lua/work/directory')));
```

4. Register runtime in your Lua code

```lua
require('babel-lua-runtime.register')
```

## Types

Babel Lua not includes runtime type check (so `Math.floor('1')` will lead to undefined behavior).

To prevent such errors Babel Lua is meant to be used with compile-time type check.

With Babel 7 you can use either [Flow](https://github.com/babel/babel/tree/master/packages/babel-preset-flow/) or [TypeScript](https://github.com/babel/babel/tree/master/packages/babel-preset-typescript).

Although you shouldn't use Lua standard library, in some cases it might be necessary.
In that case [Lua Types](https://github.com/ark120202/lua-types) might be useful.

If you are running lua within environment which provides it's own globals,
you have to make type definitions by yourself.
Some user-made type definitions are listed there:

| Environment | Repository | npm |
|:---------------:|:------------------------------------------------:|:-------------------------------------------------:|
| Dota 2 VScripts | <https://github.com/ark120202/types-dota-vscripts> | [![npm](https://img.shields.io/npm/dm/types-dota-vscripts.svg)](https://www.npmjs.com/package/types-dota-vscripts) |
