export const REQUIRE_REGEXP: RegExp;
export function findImports(code: string): string[];
export function replaceImports(code: string, replacer: (module: string) => string | Error): string;
export function getRelativeLuaPath(luaRoot: string, filePath: string): string;
