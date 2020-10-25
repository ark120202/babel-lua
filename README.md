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

1. Get latest `babel-lua-preset` from npm

```bash
yarn add -D @babel/core babel-lua-preset
# or
npm install -D @babel/core babel-lua-preset
```


> Babel Lua is not published to npm now, instead you can clone this repository, build it and install module from directory.

2. Modify your Babel config to use `babel-lua-preset`.

```json
{
  "presets": ["babel-lua-preset"]
}
```

babel-lua-preset is based on babel-preset-es2015.

babel-lua-preset is incompatible with babel-preset-env, so to use next ES versions, you have to use babel-preset-es\*\*\*\*

3. Add `import 'babel-lua-runtime'` to your entry file. More information about using libraries from npm is below.

## Libraries

With Babel Lua you can use modules from npm.
`import 'module'` is transformed to `require('node_modules.module')`.
> Note: only ES6 modules are supported

```js

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

|   Environment   |                     Repository                     |                                                        npm                                                         |
| :-------------: | :------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------: |
| Dota 2 VScripts | <https://github.com/ark120202/types-dota-vscripts> | [![npm](https://img.shields.io/npm/dm/types-dota-vscripts.svg)](https://www.npmjs.com/package/types-dota-vscripts) |
