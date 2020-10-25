// https://www.lua.org/manual/5.3/manual.html#3.1
// TODO: https://www.npmjs.com/package/transliteration
const IDENTIFIER_REGEXP = /[^\w]/g;
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

function escapeIdentifier(name) {
  if (RESERVED_WORDS_LUA.has(name)) return name;
  if (IDENTIFIER_REGEXP.test(name)) return name.replace(IDENTIFIER_REGEXP, '');

  return null;
}

export default function({ types: t }) {
  return {
    visitor: {
      'BindingIdentifier|ReferencedIdentifier': function BRIdentifier(path) {
        const name = escapeIdentifier(path.node.name);
        if (name != null) path.scope.rename(name);
      },

      MemberExpression(path) {
        const { node } = path;
        if (!node.computed && escapeIdentifier(node.property.name) != null) {
          node.property = t.stringLiteral(node.property.name);
          node.computed = true;

          if (path.parentPath.isCallExpression()) path.parentPath.requeue();
        }
      },

      ObjectProperty(path) {
        const key = path.get('key');
        if (key.isIdentifier() && escapeIdentifier(key.node.name) != null) {
          key.replaceWith(t.stringLiteral(key.node.name));
        }
      },
    },
  };
}
