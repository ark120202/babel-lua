const fs = require('fs');
const { promisify } = require('util');

const _readFile = promisify(fs.readFile);

export async function readFile(p) {
  return _readFile(p, 'utf-8');
}

export function readFileSync(p) {
  return fs.readFileSync(p, 'utf-8');
}

export const { readdirSync } = fs;

export const writeFile = promisify(fs.writeFile);

export const stat = promisify(fs.stat);

export async function isFile(p) {
  try {
    return (await stat(p)).isFile();
  } catch (e) {
    return false;
  }
}

export function isFileSync(p) {
  try {
    return fs.statSync(p).isFile();
  } catch (e) {
    return false;
  }
}

export async function isDirectory(p) {
  try {
    return (await stat(p)).isDirectory();
  } catch (e) {
    return false;
  }
}

export function isDirectorySync(d) {
  try {
    return fs.statSync(d).isDirectory();
  } catch (e) {
    return false;
  }
}

export const readdir = promisify(fs.readdir);
