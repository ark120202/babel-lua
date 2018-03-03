import { addDefault, isModule } from '@babel/helper-module-imports';
import { types as t } from '@babel/core';

import definitions from './definitions';

const HEADER_HELPERS = ['interopRequireWildcard', 'interopRequireDefault'];

export default function(api, options) {
  const { moduleName = 'babel-lua-runtime' } = options;

  return {
    pre(file) {
      file.set('helperGenerator', name => {
        const isInteropHelper = HEADER_HELPERS.includes(name);

        // Explicitly set the CommonJS interop helpers to their reserve
        // blockHoist of 4 so they are guaranteed to exist
        // when other things used them to import.
        const blockHoist = isInteropHelper && !isModule(file.path) ? 4 : undefined;

        return this.addDefaultImport(`${moduleName}/helpers/${name}`, name, blockHoist);
      });

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
        if (definitions.builtins[node.name] == null) return;
        if (scope.getBindingIdentifier(node.name)) return;

        // Symbol() -> _core.Symbol(); new Promise -> new _core.Promise
        path.replaceWith(
          this.addDefaultImport(
            `${moduleName}/builtins/${definitions.builtins[node.name]}`,
            node.name,
          ),
        );
      },
    },
  };
}

export { definitions };
