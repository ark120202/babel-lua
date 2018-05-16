import { LuaNode } from 'lua-parse';
import { Format } from './printer';

interface GeneratorOptions extends Format {
  compact: boolean | 'auto';
  sourceMaps?: boolean;
}

export default function generate(
  ast: LuaNode,
  opts?: GeneratorOptions,
  code?: string | { [key: string]: string },
): string;
