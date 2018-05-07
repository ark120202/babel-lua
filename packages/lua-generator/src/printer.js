/**
 * Originally copied from @babel/generate/src/printer.js
 */

import isInteger from 'lodash/isInteger';
import repeat from 'lodash/repeat';
import * as t from 'lua-types';
import * as n from './node';
import CodeBuffer from './buffer';

import * as generatorFunctions from './generators';

const SCIENTIFIC_NOTATION = /e/i;
const ZERO_DECIMAL_INTEGER = /\.0+$/;
const NON_DECIMAL_LITERAL = /^0[box]/;

function commaSeparator() {
  this.token(',');
  this.space();
}

export default class Printer {
  constructor(format, map) {
    this.format = format;
    this._buf = new CodeBuffer(map);
  }

  inForStatementInitCounter = 0;

  _buf;
  _printStack = [];
  _indent = 0;
  _noLineTerminator = false;
  _endsWithInteger = false;
  _endsWithWord = false;
  _endsWithCallStatement = false;

  generate(ast) {
    this.print(ast);

    return this._buf.get();
  }

  /**
   * Increment indent size.
   */

  indent() {
    if (this.format.compact || this.format.concise) return;

    this._indent += 1;
  }

  /**
   * Decrement indent size.
   */

  dedent() {
    if (this.format.compact || this.format.concise) return;

    this._indent -= 1;
  }

  /**
   * Add a semicolon to the buffer.
   */

  semicolon(force = false) {
    if (force || ((this.format.compact || this.format.concise) && !this.endsWith('\n'))) {
      this._append(';', !force);
      this._endsWithCallStatement = false;
    }
    // TODO: Print semicolons only when required.
    // In most places in Lua semicolons can be replaced with newlines, but in this case it fails:
    // (function() end)();
    // (function() end)()
  }

  /**
   * End block with word.
   */

  endBlock(str = 'end') {
    if (this.format.minified) {
      this._buf.removeLastSemicolon();
    }
    this.word(str);
  }

  /**
   * Add a space to the buffer unless it is compact.
   */

  space(force = false) {
    if (this.format.compact) return;

    if ((this._buf.hasContent() && !this.endsWith(' ') && !this.endsWith('\n')) || force) {
      this._space();
    }
  }

  /**
   * Writes a token that can't be safely parsed without taking whitespace into account.
   */

  word(str) {
    if (this._endsWithWord) this._space();

    this._append(str);

    this._endsWithWord = true;
  }

  /**
   * Writes a number token so that we can validate if it is an integer.
   */

  number(str) {
    this.word(str);

    // Integer tokens need special handling because they cannot have '.'s inserted
    // immediately after them.
    this._endsWithInteger =
      isInteger(+str) &&
      !NON_DECIMAL_LITERAL.test(str) &&
      !SCIENTIFIC_NOTATION.test(str) &&
      !ZERO_DECIMAL_INTEGER.test(str) &&
      str[str.length - 1] !== '.';
  }

  /**
   * Writes a simple token.
   */

  token(str) {
    if (
      (str === '[[' && this.endsWith('--')) ||
      (str === '..' && this.endsWith('.')) ||
      // Needs spaces to avoid changing '34' to '34.', which would still be a valid number.
      (str[0] === '.' && this._endsWithInteger)
    ) {
      this._space();
    }

    this._append(str);
  }

  /**
   * Add a newline (or many newlines), maintaining formatting.
   */

  newline(i = 1) {
    if (this.format.retainLines || this.format.compact) return;

    if (this.format.concise) {
      this.space();
      return;
    }

    // never allow more than two lines
    if (this.endsWith('\n\n')) return;

    i = Math.min(2, i);
    if (this.endsWith('{\n') || this.endsWith(':\n')) i -= 1;
    if (i <= 0) return;

    for (let j = 0; j < i; j += 1) {
      this._newline();
    }
  }

  endsWith(str) {
    return this._buf.endsWith(str);
  }

  removeTrailingNewline() {
    this._buf.removeTrailingNewline();
  }

  source(prop, loc) {
    this._catchUp(prop, loc);

    this._buf.source(prop, loc);
  }

  withSource(prop, loc, cb) {
    this._catchUp(prop, loc);

    this._buf.withSource(prop, loc, cb);
  }

  _space() {
    this._append(' ', true);
  }

  _newline() {
    this._append('\n', true);
  }

  _append(str, queue = false) {
    this._maybeIndent(str);

    if (queue) this._buf.queue(str);
    else this._buf.append(str);

    this._endsWithWord = false;
    this._endsWithInteger = false;
  }

  _maybeIndent(str) {
    // we've got a newline before us so prepend on the indentation
    if (this._indent && this.endsWith('\n') && str[0] !== '\n') {
      this._buf.queue(this._getIndent());
    }
  }

  _catchUp(prop, loc) {
    if (!this.format.retainLines) return;

    // catch up to this nodes newline if we're behind
    const pos = loc ? loc[prop] : null;
    if (pos && pos.line !== null) {
      const count = pos.line - this._buf.getCurrentLine();

      for (let i = 0; i < count; i += 1) {
        this._newline();
      }
    }
  }

  /**
   * Get the current indent.
   */

  _getIndent() {
    return repeat(this.format.indent.style, this._indent);
  }

  print(node, parent) {
    if (!node) return;

    const oldConcise = this.format.concise;
    if (node._compact) {
      this.format.concise = true;
    }

    const printMethod = this[node.type];
    if (!printMethod) {
      throw new ReferenceError(
        `unknown node of type ${JSON.stringify(node.type)} with constructor ${JSON.stringify(
          node && node.constructor.name,
        )}`,
      );
    }

    this._printStack.push(node);

    const needsParens = n.needsParens(node, parent, this._printStack);
    if (needsParens) {
      if (this._endsWithCallStatement) this.semicolon(true);
      this.token('(');
    }

    // this._printLeadingComments(node, parent);

    const loc = t.isChunk(node) ? null : node.loc;
    this.withSource('start', loc, () => {
      this[node.type](node, parent);
    });

    // this._printTrailingComments(node, parent);

    if (needsParens) this.token(')');

    // end
    this._printStack.pop();
    this._endsWithCallStatement = node.type === 'CallStatement';

    this.format.concise = oldConcise;
  }

  getPossibleRaw({ value, extra }) {
    if (extra && extra.raw != null && extra.rawValue != null && value === extra.rawValue) {
      return extra.raw;
    }
    return null;
  }

  printJoin(nodes, parent, opts = {}) {
    if (!nodes || nodes.length === 0) return;

    if (opts.indent) this.indent();

    const newlineOpts = {
      addNewlines: opts.addNewlines,
    };

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (node) {
        if (opts.statement) this._printNewline(true, node, parent, newlineOpts);

        this.print(node, parent);

        if (opts.iterator) {
          opts.iterator(node, i);
        }

        if (opts.separator && i < nodes.length - 1) {
          opts.separator.call(this);
        }

        if (opts.statement) this._printNewline(false, node, parent, newlineOpts);
      }
    }

    if (opts.indent) this.dedent();
  }

  printBlock(parent) {
    const node = parent.body;

    if (node != null) {
      this.space();
    }

    this._printBlockStatement(node, parent);
  }

  _printBlockStatement(elements, parent) {
    if (elements.length > 0) {
      this.newline();

      this.printSequence(elements, parent, { indent: true });
      this.removeTrailingNewline();

      this.source('end', parent.loc);

      if (!this.endsWith('\n')) this.newline();
    } else {
      this.source('end', parent.loc);
    }
  }

  printSequence(nodes, parent, opts = {}) {
    opts.statement = true;
    return this.printJoin(nodes, parent, opts);
  }

  printList(items, parent, opts = {}) {
    if (opts.separator == null) {
      opts.separator = commaSeparator;
    }

    return this.printJoin(items, parent, opts);
  }

  _printNewline(leading, node, parent, opts) {
    // Fast path since 'this.newline' does nothing when not tracking lines.
    if (this.format.retainLines || this.format.compact) return;

    // Fast path for concise since 'this.newline' just inserts a space when
    // concise formatting is in use.
    if (this.format.concise) {
      this.space();
      return;
    }

    let lines = 0;
    // don't add newlines at the beginning of the file
    if (this._buf.hasContent()) {
      if (!leading) lines += 1; // always include at least a single line after
      if (opts.addNewlines) lines += opts.addNewlines(leading, node) || 0;

      const needs = leading ? n.needsWhitespaceBefore : n.needsWhitespaceAfter;
      if (needs(node, parent)) lines += 1;
    }

    this.newline(lines);
  }
}

// Expose the node type functions and helpers on the prototype for easy usage.
Object.assign(Printer.prototype, generatorFunctions);
