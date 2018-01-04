import { addDefault, isModule } from '@babel/helper-module-imports';
import { types as t } from '@babel/core';

import definitions from './definitions';

export default function(api, options) {
  const { helpers, moduleName = 'babel-lua-runtime', polyfill, useBuiltIns } = options;
  const isPolyfillAndUseBuiltIns = polyfill && useBuiltIns;

  function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  const HEADER_HELPERS = ['interopRequireWildcard', 'interopRequireDefault'];

  return {
    pre(file) {
      if (helpers !== false) {
        file.set('helperGenerator', name => {
          const isInteropHelper = HEADER_HELPERS.indexOf(name) !== -1;

          // Explicitly set the CommonJS interop helpers to their reserve
          // blockHoist of 4 so they are guaranteed to exist
          // when other things used them to import.
          const blockHoist = isInteropHelper && !isModule(file.path) ? 4 : undefined;

          return this.addDefaultImport(`${moduleName}.helpers.${name}`, name, blockHoist);
        });
      }

      if (isPolyfillAndUseBuiltIns) {
        throw new Error('The polyfill option conflicts with useBuiltIns; use one or the other');
      }

      this.moduleName = moduleName;

      const cache = new Map();

      this.addDefaultImport = (source, nameHint, blockHoist) => {
        // If something on the page adds a helper when the file is an ES6
        // file, we can't reused the cached helper name after things have been
        // transformed because it has almost certainly been renamed.
        const cacheKey = isModule(file.path);
        const key = `${source}:${nameHint}:${cacheKey || ''}`;

        let cached = cache.get(key);
        if (cached) {
          cached = t.cloneDeep(cached);
        } else {
          cached = addDefault(file.path, source, {
            importedInterop: 'uncompiled',
            nameHint,
            blockHoist,
          });

          cache.set(key, cached);
        }
        return cached;
      };
    },

    visitor: {
      Identifier(path) {
        const { node, parent, scope } = path;

        // ARRAY.from is ok, array.FROM is not
        if (t.isMemberExpression(parent) && parent.object !== node) return;
        if (!has(definitions.builtins, node.name)) return;
        if (scope.getBindingIdentifier(node.name)) return;

        // Symbol() -> _core.Symbol(); new Promise -> new _core.Promise
        path.replaceWith(
          this.addDefaultImport(
            `${moduleName}.builtins.${definitions.builtins[node.name]}`,
            node.name,
          ),
        );
      },
    },
  };
}

export { definitions };
