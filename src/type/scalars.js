/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import inspect from '../jsutils/inspect';
import isFinite from '../jsutils/isFinite';
import isInteger from '../jsutils/isInteger';
import { GraphQLScalarType, isNamedType } from './definition';
import { Kind } from '../language/kinds';

// As per the GraphQL Spec, Integers are only treated as valid when a valid
// 32-bit signed integer, providing the broadest support across platforms.
//
// n.b. JavaScript's integers are safe between -(2^53 - 1) and 2^53 - 1 because
// they are internally represented as IEEE 754 doubles.
const MAX_INT = 2147483647;
const MIN_INT = -2147483648;

function serializeInt(value: mixed): number {
  if (Array.isArray(value)) {
    throw new TypeError(
      `Int cannot represent an array value: ${inspect(value)}`,
    );
  }
  const num = Number(value);
  if (value === '' || !isInteger(num)) {
    throw new TypeError(
      `Int cannot represent non-integer value: ${inspect(value)}`,
    );
  }
  if (num > MAX_INT || num < MIN_INT) {
    throw new TypeError(
      `Int cannot represent non 32-bit signed integer value: ${inspect(value)}`,
    );
  }
  return num;
}

function coerceInt(value: mixed): number {
  if (!isInteger(value)) {
    throw new TypeError(
      `Int cannot represent non-integer value: ${inspect(value)}`,
    );
  }
  if (value > MAX_INT || value < MIN_INT) {
    throw new TypeError(
      `Int cannot represent non 32-bit signed integer value: ${inspect(value)}`,
    );
  }
  return value;
}

export const GraphQLInt = new GraphQLScalarType({
  name: 'Int',
  description:
    'The `Int` scalar type represents non-fractional signed whole numeric ' +
    'values. Int can represent values between -(2^31) and 2^31 - 1. ',
  serialize: serializeInt,
  parseValue: coerceInt,
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      const num = parseInt(ast.value, 10);
      if (num <= MAX_INT && num >= MIN_INT) {
        return num;
      }
    }
    return undefined;
  },
});

function serializeFloat(value: mixed): number {
  if (Array.isArray(value)) {
    throw new TypeError(
      `Float cannot represent an array value: ${inspect(value)}`,
    );
  }
  const num = Number(value);
  if (value === '' || !isFinite(num)) {
    throw new TypeError(
      `Float cannot represent non numeric value: ${inspect(value)}`,
    );
  }
  return num;
}

function coerceFloat(value: mixed): number {
  if (!isFinite(value)) {
    throw new TypeError(
      `Float cannot represent non numeric value: ${inspect(value)}`,
    );
  }
  return value;
}

export const GraphQLFloat = new GraphQLScalarType({
  name: 'Float',
  description:
    'The `Float` scalar type represents signed double-precision fractional ' +
    'values as specified by ' +
    '[IEEE 754](http://en.wikipedia.org/wiki/IEEE_floating_point). ',
  serialize: serializeFloat,
  parseValue: coerceFloat,
  parseLiteral(ast) {
    return ast.kind === Kind.FLOAT || ast.kind === Kind.INT
      ? parseFloat(ast.value)
      : undefined;
  },
});

function serializeString(value: mixed): string {
  // Support serializing objects with custom valueOf() functions - a common way
  // to represent an complex value which can be represented as a string
  // (ex: MongoDB id objects).
  const result =
    value && typeof value.valueOf === 'function' ? value.valueOf() : value;
  // Serialize string, number, and boolean values to a string, but do not
  // attempt to coerce object, function, symbol, or other types as strings.
  if (
    typeof result !== 'string' &&
    typeof result !== 'number' &&
    typeof result !== 'boolean'
  ) {
    throw new TypeError(`String cannot represent value: ${inspect(result)}`);
  }
  return String(result);
}

function coerceString(value: mixed): string {
  if (typeof value !== 'string') {
    throw new TypeError(
      `String cannot represent a non string value: ${inspect(value)}`,
    );
  }
  return value;
}

export const GraphQLString = new GraphQLScalarType({
  name: 'String',
  description:
    'The `String` scalar type represents textual data, represented as UTF-8 ' +
    'character sequences. The String type is most often used by GraphQL to ' +
    'represent free-form human-readable text.',
  serialize: serializeString,
  parseValue: coerceString,
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? ast.value : undefined;
  },
});

function serializeBoolean(value: mixed): boolean {
  if (Array.isArray(value)) {
    throw new TypeError(
      `Boolean cannot represent an array value: ${inspect(value)}`,
    );
  }
  return Boolean(value);
}

function coerceBoolean(value: mixed): boolean {
  if (typeof value !== 'boolean') {
    throw new TypeError(
      `Boolean cannot represent a non boolean value: ${inspect(value)}`,
    );
  }
  return value;
}

export const GraphQLBoolean = new GraphQLScalarType({
  name: 'Boolean',
  description: 'The `Boolean` scalar type represents `true` or `false`.',
  serialize: serializeBoolean,
  parseValue: coerceBoolean,
  parseLiteral(ast) {
    return ast.kind === Kind.BOOLEAN ? ast.value : undefined;
  },
});

function serializeID(value: mixed): string {
  // Support serializing objects with custom valueOf() functions - a common way
  // to represent an object identifier (ex. MongoDB).
  const result =
    value && typeof value.valueOf === 'function' ? value.valueOf() : value;
  if (
    typeof result !== 'string' &&
    (typeof result !== 'number' || !isInteger(result))
  ) {
    throw new TypeError(`ID cannot represent value: ${inspect(value)}`);
  }
  return String(result);
}

function coerceID(value: mixed): string {
  if (
    typeof value !== 'string' &&
    (typeof value !== 'number' || !isInteger(value))
  ) {
    throw new TypeError(`ID cannot represent value: ${inspect(value)}`);
  }
  return String(value);
}

export const GraphQLID = new GraphQLScalarType({
  name: 'ID',
  description:
    'The `ID` scalar type represents a unique identifier, often used to ' +
    'refetch an object or as key for a cache. The ID type appears in a JSON ' +
    'response as a String; however, it is not intended to be human-readable. ' +
    'When expected as an input type, any string (such as `"4"`) or integer ' +
    '(such as `4`) input value will be accepted as an ID.',
  serialize: serializeID,
  parseValue: coerceID,
  parseLiteral(ast) {
    return ast.kind === Kind.STRING || ast.kind === Kind.INT
      ? ast.value
      : undefined;
  },
});

export const specifiedScalarTypes: $ReadOnlyArray<*> = [
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLID,
];

export function isSpecifiedScalarType(type: mixed): boolean %checks {
  return (
    isNamedType(type) &&
    // Would prefer to use specifiedScalarTypes.some(), however %checks needs
    // a simple expression.
    (type.name === GraphQLString.name ||
      type.name === GraphQLInt.name ||
      type.name === GraphQLFloat.name ||
      type.name === GraphQLBoolean.name ||
      type.name === GraphQLID.name)
  );
}