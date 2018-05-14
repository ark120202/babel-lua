import generate from 'lua-generator';
import transform from './transform';

const FOR_OF_UID = Symbol.for('for..of uid');
export default function() {
  return {
    visitor: {
      ForOfStatement(path) {
        const uid = path.scope.generateUidIdentifier('');
        path.node[FOR_OF_UID] = uid;
      },
    },

    generatorOverride(ast, options, code) {
      const luaAst = transform(ast);
      if (Array.isArray(luaAst)) throw new Error('Unexpected array as transformation result');
      const lua = generate(luaAst, options, code);
      return lua;
    },
  };
}
