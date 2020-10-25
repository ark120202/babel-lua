declare module '@babel/types/lib/definitions/utils' {
  export const VISITOR_KEYS: { [key: string]: string[] };
  export const ALIAS_KEYS: { [key: string]: string[] };
  export const FLIPPED_ALIAS_KEYS: { [key: string]: string[] };
  export const NODE_FIELDS: { [key: string]: {} };
  export const BUILDER_KEYS: { [key: string]: string[] };
  export const DEPRECATED_KEYS: { [key: string]: string };

  export type Validator = (arg1: any, arg2: string, arg3: any) => void;

  export interface FieldOptions {
    default?: any;
    optional?: boolean;
    validate?: Validator;
  }

  export function validate(validate: Validator): FieldOptions;
  export function typeIs(typeName: string | string[]): Validator;
  export function validateType(typeName: string | string[]): FieldOptions;
  export function validateOptional(validate: Validator): FieldOptions;
  export function validateOptionalType(typeName: string | string[]): FieldOptions;
  export function arrayOf(elementType: Validator): Validator;
  export function arrayOfType(typeName: string | string[]): Validator;
  export function validateArrayOfType(typeName: string | string[]): FieldOptions;
  export function assertEach(callback: Validator): Validator;
  export function assertOneOf(...values: any[]): Validator;
  export function assertNodeType(...types: string[]): Validator;
  export function assertNodeOrValueType(...types: string[]): Validator;
  export function assertValueType(type: string): Validator;
  export function chain(...fns: Validator[]): Validator;
  export default function defineType(
    type: string,
    opts: {
      fields?: { [key: string]: FieldOptions };
      visitor?: string[];
      aliases?: string[];
      builder?: string[];
      inherits?: string;
      deprecatedAlias?: string;
    },
  ): void;
}

declare module '@babel/types' {
  export const VISITOR_KEYS: { [key: string]: string[] };
  export const ALIAS_KEYS: { [key: string]: string[] };
  export const FLIPPED_ALIAS_KEYS: { [key: string]: string[] };
  export const NODE_FIELDS: { [key: string]: {} };
  export const BUILDER_KEYS: { [key: string]: string[] };
  export const DEPRECATED_KEYS: { [key: string]: string };
  export const TYPES: string[];
}

declare module '@babel/core' {
  export * from 'babel-core';
}
