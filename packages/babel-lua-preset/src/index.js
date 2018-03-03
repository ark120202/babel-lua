import transformES2015TemplateLiterals from '@babel/plugin-transform-template-literals';
import transformES2015Literals from '@babel/plugin-transform-literals';
import transformES2015ArrowFunctions from '@babel/plugin-transform-arrow-functions';
import transformES2015BlockScopedFunctions from '@babel/plugin-transform-block-scoped-functions';
import transformES2015Classes from '@babel/plugin-transform-classes';
import transformES2015ObjectSuper from '@babel/plugin-transform-object-super';
import transformES2015ShorthandProperties from '@babel/plugin-transform-shorthand-properties';
import transformES2015DuplicateKeys from '@babel/plugin-transform-duplicate-keys';
import transformES2015ComputedProperties from '@babel/plugin-transform-computed-properties';
import transformES2015ForOf from '@babel/plugin-transform-for-of';
import transformES2015StickyRegex from '@babel/plugin-transform-sticky-regex';
import transformES2015UnicodeRegex from '@babel/plugin-transform-unicode-regex';
import checkES2015Constants from '@babel/plugin-check-constants';
import transformES2015Spread from '@babel/plugin-transform-spread';
import transformES2015Destructuring from '@babel/plugin-transform-destructuring';
import transformES2015BlockScoping from '@babel/plugin-transform-block-scoping';
import transformES2015TypeofSymbol from '@babel/plugin-transform-typeof-symbol';
import transformES2015ModulesCommonJS from '@babel/plugin-transform-modules-commonjs';
import transformES2015Instanceof from '@babel/plugin-transform-instanceof';
import transformRegenerator from '@babel/plugin-transform-regenerator';

import luaGenerator from 'babel-plugin-lua-generator';
import luaModule from 'babel-plugin-lua-module';
import luaModuleResolver from 'babel-plugin-lua-module-resolver';
import luaParameters from 'babel-plugin-lua-parameters';
import luaReservedWords from 'babel-plugin-lua-reserved-words';
import luaRuntime from 'babel-plugin-lua-runtime';
import luaTernary from 'babel-plugin-lua-ternary';
import luaTypeof from 'babel-plugin-lua-typeof';
import luaGeneratorToCoroutine from 'babel-plugin-lua-generator-to-coroutine';

export default function(api, opts = {}) {
  const loose = opts.loose || false;
  const spec = opts.spec || false;
  const { luaRoot } = opts;

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
      [transformES2015Classes, optsLoose],
      transformES2015ObjectSuper,
      transformES2015ShorthandProperties,
      transformES2015DuplicateKeys,
      [transformES2015ComputedProperties, optsLoose],
      [transformES2015ForOf, optsLoose],
      transformES2015StickyRegex,
      transformES2015UnicodeRegex,
      checkES2015Constants,
      [transformES2015Spread, optsLoose],
      [transformES2015Destructuring, optsLoose],
      transformES2015BlockScoping,
      transformES2015TypeofSymbol,
      transformES2015Instanceof,
      [transformES2015ModulesCommonJS, optsLoose],

      [transformRegenerator, { async: false, asyncGenerators: false }],

      luaGenerator,
      luaModule,
      [luaModuleResolver, { luaRoot }],
      luaParameters,
      luaReservedWords,
      luaRuntime,
      luaTernary,
      luaTypeof,
      luaGeneratorToCoroutine,
    ],
  };
}
