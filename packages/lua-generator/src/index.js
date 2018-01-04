/* @flow */

import SourceMap from './source-map';
import Printer, { type Format } from './printer';

interface GeneratorOptions extends Format {
  sourceMaps?: boolean;
}

function normalizeOptions(opts: GeneratorOptions): Format {
  const format = {
    retainLines: opts.retainLines,
    compact: opts.compact,
    minified: opts.minified,
    concise: opts.concise,
    quotes: 'double',
    indent: {
      style: '    ',
      base: 0,
    },
  };

  if (format.minified) {
    format.compact = true;
  }

  return format;
}

export default function generate(
  ast: Object,
  opts: GeneratorOptions = {},
  code?: string | { [string]: string },
) {
  const format = normalizeOptions(opts);
  const map = opts.sourceMaps ? new SourceMap(opts, code) : null;
  const printer = new Printer(format, map);

  return printer.generate(ast);
}
