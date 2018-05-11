import path from 'upath';

export const REQUIRE_REGEXP = /require *(?:\( *'(.*?)' *\)|\( *"(.*?)" *\)| *'(.*?)'| *"(.*?)")/g;
export function findImports(code) {
  const requires = [];

  let groups = REQUIRE_REGEXP.exec(code);
  while (groups) {
    requires.push(groups[4] || groups[3] || groups[2] || groups[1]);
    groups = REQUIRE_REGEXP.exec(code);
  }

  return requires;
}

export function replaceImports(code, replacer) {
  return code.replace(
    REQUIRE_REGEXP,
    (_, m1, m2, m3, m4) => `require("${replacer(m4 || m3 || m2 || m1)}")`,
  );
}

export class LuaModuleResolverPlugin {
  constructor(localDescriptionFileRoot, luaRoot) {
    this.localDescriptionFileRoot = localDescriptionFileRoot;
    this.luaRoot = luaRoot;
  }

  apply(resolver) {
    resolver.getHook('resolved').tap('LuaRootResolvePlugin', request => {
      let result;
      // TODO: Check if there's a better way to check if resolved path is a module
      const isModule = request.descriptionFileRoot !== this.localDescriptionFileRoot;
      // Array.from(resolveContext.stack).some(x => x.startsWith('module: '));

      if (isModule) {
        const relative = path.relative(path.dirname(request.descriptionFileRoot), request.path);
        result = `node_modules/${relative}`;
      } else {
        result = path.relative(this.luaRoot, request.path);
        if (result.startsWith('..') || path.isAbsolute(result)) {
          throw new Error(`Couldn't resolve path "${request.path}" within luaRoot`);
        }
      }

      result = path.toUnix(path.trimExt(result));

      if (result.includes('.')) {
        throw new Error(`Resolved path shouldn't contain dots`);
      }

      result = result.replace(/\//g, '.');
      request.path = result;
      return request;
    });
  }
}
