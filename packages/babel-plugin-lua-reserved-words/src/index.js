const RESERVED_WORDS_LUA = new Set([
  'and',
  'break',
  'do',
  'else',
  'elseif',
  'end',
  'false',
  'for',
  'function',
  'goto',
  'if',
  'in',
  'local',
  'nil',
  'not',
  'or',
  'repeat',
  'return',
  'then',
  'true',
  'until',
  'while',
]);

export default function({ types: t }) {
  return {
    visitor: {
      'BindingIdentifier|ReferencedIdentifier': function BRIdentifier(path) {
        if (RESERVED_WORDS_LUA.has(path.node.name)) {
          path.scope.rename(path.node.name);
        }
      },

      MemberExpression(path) {
        const { node } = path;
        if (!node.computed && RESERVED_WORDS_LUA.has(node.property.name)) {
          node.property = t.stringLiteral(node.property.name);
          node.computed = true;

          if (path.parentPath.isCallExpression()) path.parentPath.requeue();
        }
      },

      ObjectProperty(path) {
        const key = path.get('key');
        if (key.isIdentifier() && RESERVED_WORDS_LUA.has(key.node.name)) {
          key.replaceWith(t.stringLiteral(key.node.name));
        }
      },
    },
  };
}
