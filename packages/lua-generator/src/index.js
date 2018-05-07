/* @flow */

import SourceMap from './source-map';
import Printer, { type Format } from './printer';

interface GeneratorOptions extends Format {
  compact: boolean | 'auto';
  sourceMaps?: boolean;
}

function normalizeOptions(code: string, opts: GeneratorOptions): Format {
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

  if (format.compact === 'auto') {
    format.compact = code.length > 500_000; // 500KB

    if (format.compact) {
      console.error(
        '[BABEL] Note: The code generator has deoptimised the styling of ' +
          `${opts.filename} as it exceeds the max of ${'500KB'}.`,
      );
    }
  }

  return format;
}

export default function generate(
  ast: Object,
  opts: GeneratorOptions = {},
  code?: string | { [string]: string },
) {
  const format = normalizeOptions(
    typeof code === 'string' ? code : Object.values(code).join(''),
    opts,
  );
  const map = opts.sourceMaps ? new SourceMap(opts, code) : null;
  const printer = new Printer(format, map);

  return printer.generate(ast);
}
