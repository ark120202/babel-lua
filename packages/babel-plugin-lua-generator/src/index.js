import { type LuaNode } from 'lua-types';
import generate from 'lua-generator';
import transform from './transform';

export default function() {
  return {
    generatorOverride(ast: LuaNode, options: Object, code: string): { code: string } {
      const luaAst = transform(ast);
      if (Array.isArray(luaAst)) throw new Error('Unexpected array as transformation result');
      const lua = generate(luaAst, options, code);
      return lua;
    },
    visitor: {
      'BindingIdentifier|ReferencedIdentifier': function BRIdentifier(path) {
        // see ForOfStatement
        if (path.node.name === '__blk_') {
          path.scope.rename(path.node.name);
        }
      },
    },
  };
}
