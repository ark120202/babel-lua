import { ResolverFactory } from 'enhanced-resolve';

export const REQUIRE_REGEXP: RegExp;
export function findImports(code: string): string[];
export function replaceImports(code: string, replacer: (module: string) => string | Error): string;

export class LuaModuleResolverPlugin {
  localDescriptionFileRoot: string;
  luaRoot: string;
  constructor(localDescriptionFileRoot: string, luaRoot: string);

  apply(resolver: ResolverFactory.ResolverOption): void;
}
