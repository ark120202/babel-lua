import generate from 'lua-generator';
import transform from './transform';

const FOR_OF_UID = Symbol.for('for..of uid');
export default function({ types: t }) {
  return {
    visitor: {
      ForOfStatement(path) {
        const uid = path.scope.generateUidIdentifier('');
        path.node[FOR_OF_UID] = uid;
      },

      ReturnStatement(path) {
        if (
          path.getNextSibling().node != null &&
          (!path.parentPath.isBlockStatement() || path.parent.body.length > 1)
        ) {
          path.replaceWith(t.blockStatement([path.node]));
        }
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
