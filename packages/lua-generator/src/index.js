import SourceMap from './source-map';
import Printer from './printer';

function normalizeOptions(code, opts) {
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
    let codeLength = 0;
    if (code != null) {
      codeLength = typeof code === 'string' ? code.length : Object.values(code).join('').length;
    }

    format.compact = codeLength > 500_000; // 500KB

    if (format.compact) {
      console.error(
        '[BABEL] Note: The code generator has deoptimised the styling of ' +
          `${opts.filename} as it exceeds the max of ${'500KB'}.`,
      );
    }
  }

  return format;
}

export default function generate(ast, opts = {}, code) {
  const format = normalizeOptions(code, opts);
  const map = opts.sourceMaps ? new SourceMap(opts, code) : null;
  const printer = new Printer(format, map);

  return printer.generate(ast);
}
