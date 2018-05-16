import { LuaparseOptions, LuaNode as LuaParseNode } from 'luaparse';

export interface LuaNode extends LuaParseNode {
  loc?: SourceLocation & { filename?: string };
  _compact?: boolean;
}

export interface Options extends LuaparseOptions {
  filename: string;
}

export default function parse(input: string, options?: Options): LuaNode;
