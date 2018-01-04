import * as t from 'lua-types';
import * as whitespace from './whitespace';
import * as parens from './parentheses';

function expandAliases(obj) {
  const newObj = {};

  function add(type, func) {
    const fn = newObj[type];
    newObj[type] = fn
      ? (node, parent, stack) => {
          const result = fn(node, parent, stack);

          return result == null ? func(node, parent, stack) : result;
        }
      : func;
  }

  Object.keys(obj).forEach(type => add(type, obj[type]));

  return newObj;
}

// Rather than using `t.is` on each object property, we pre-expand any type aliases
// into concrete types so that the 'find' call below can be as fast as possible.
const expandedParens = expandAliases(parens);
const expandedWhitespaceNodes = expandAliases(whitespace.nodes);
const expandedWhitespaceList = expandAliases(whitespace.list);

function find(obj, node, parent, printStack) {
  const fn = obj[node.type];
  return fn ? fn(node, parent, printStack) : null;
}

/**
 * Note: actually used for newlines
 */
export function needsWhitespace(node, parent, type) {
  if (!node) return 0;

  if (t.isCallExpression(node)) {
    node = node.expression;
  }

  let linesInfo = find(expandedWhitespaceNodes, node, parent);

  if (!linesInfo) {
    const items = find(expandedWhitespaceList, node, parent);
    if (items) {
      for (let i = 0; i < items.length; i += 1) {
        linesInfo = needsWhitespace(items[i], node, type);
        if (linesInfo) break;
      }
    }
  }

  if (typeof linesInfo === 'object' && linesInfo !== null) {
    return linesInfo[type] || 0;
  }

  return 0;
}

export function needsWhitespaceBefore(node, parent) {
  return needsWhitespace(node, parent, 'before');
}

export function needsWhitespaceAfter(node, parent) {
  return needsWhitespace(node, parent, 'after');
}

export function needsParens(node, parent, printStack) {
  if (!parent) return false;

  return find(expandedParens, node, parent, printStack);
}
