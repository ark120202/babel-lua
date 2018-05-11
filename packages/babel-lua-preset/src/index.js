import transformES2015TemplateLiterals from '@babel/plugin-transform-template-literals';
import transformES2015Literals from '@babel/plugin-transform-literals';
import transformES2015ArrowFunctions from '@babel/plugin-transform-arrow-functions';
import transformES2015BlockScopedFunctions from '@babel/plugin-transform-block-scoped-functions';
import transformES2015ObjectSuper from '@babel/plugin-transform-object-super';
import transformES2015ShorthandProperties from '@babel/plugin-transform-shorthand-properties';
import transformES2015DuplicateKeys from '@babel/plugin-transform-duplicate-keys';
import transformES2015StickyRegex from '@babel/plugin-transform-sticky-regex';
import transformES2015UnicodeRegex from '@babel/plugin-transform-unicode-regex';
// import transformES2015Spread from '@babel/plugin-transform-spread';
import transformES2015Destructuring from '@babel/plugin-transform-destructuring';
// import transformES2015BlockScoping from '@babel/plugin-transform-block-scoping';

import luaGenerator from 'babel-plugin-lua-generator';
import luaParameters from 'babel-plugin-lua-parameters';
import luaReservedWords from 'babel-plugin-lua-reserved-words';
import luaRuntime from 'babel-plugin-lua-runtime';
import luaTernary from 'babel-plugin-lua-ternary';
import luaTypeof from 'babel-plugin-lua-typeof';
import luaGeneratorToCoroutine from 'babel-plugin-lua-generator-to-coroutine';
import luaFunctionContext from 'babel-plugin-lua-function-context';
import luaModules from 'babel-plugin-lua-modules';

export default function(api, opts = {}) {
  const loose = opts.loose || false;
  const spec = opts.spec || false;

  if (typeof loose !== 'boolean') {
    throw new TypeError("Preset lua 'loose' option must be a boolean.");
  }
  if (typeof spec !== 'boolean') {
    throw new TypeError("Preset lua 'spec' option must be a boolean.");
  }

  // be DRY
  const optsLoose = { loose };

  return {
    plugins: [
      [transformES2015TemplateLiterals, { loose, spec }],
      transformES2015Literals,
      [transformES2015ArrowFunctions, { spec }],
      transformES2015BlockScopedFunctions,
      transformES2015ObjectSuper,
      transformES2015ShorthandProperties,
      transformES2015DuplicateKeys,
      transformES2015StickyRegex,
      transformES2015UnicodeRegex,
      // [transformES2015Spread, optsLoose],
      [transformES2015Destructuring, optsLoose],
      // transformES2015BlockScoping,

      luaGenerator,
      luaParameters,
      luaReservedWords,
      luaRuntime,
      luaTernary,
      luaTypeof,
      luaGeneratorToCoroutine,
      luaFunctionContext,
      luaModules,
    ],
  };
}
