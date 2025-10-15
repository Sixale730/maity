/**
 * Common Type Utilities
 *
 * Generic TypeScript utility types for working with strict mode.
 * These helpers make it easier to work with complex types in a type-safe way.
 */

/**
 * Makes specific properties required in a type
 * @example
 * type User = { id?: string; name?: string; email: string }
 * type RequiredUser = RequireFields<User, 'id' | 'name'>
 * // { id: string; name: string; email: string }
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Makes specific properties optional in a type
 * @example
 * type User = { id: string; name: string; email: string }
 * type PartialUser = PartialFields<User, 'email'>
 * // { id: string; name: string; email?: string }
 */
export type PartialFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Removes null and undefined from all properties
 * @example
 * type User = { id: string | null; name: string | undefined }
 * type NonNullUser = NonNullableFields<User>
 * // { id: string; name: string }
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Makes all properties nullable
 * @example
 * type User = { id: string; name: string }
 * type NullableUser = Nullable<User>
 * // { id: string | null; name: string | null }
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * Deeply makes all properties optional
 * @example
 * type User = { id: string; profile: { name: string } }
 * type DeepPartialUser = DeepPartial<User>
 * // { id?: string; profile?: { name?: string } }
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extracts the element type from an array type
 * @example
 * type Users = User[]
 * type UserElement = ArrayElement<Users>
 * // User
 */
export type ArrayElement<T> = T extends (infer E)[] ? E : T;

/**
 * Extracts the resolved type from a Promise
 * @example
 * type UserPromise = Promise<User>
 * type UserResolved = PromiseType<UserPromise>
 * // User
 */
export type PromiseType<T> = T extends Promise<infer U> ? U : T;

/**
 * Readonly version of an entire object (deep)
 * @example
 * type User = { id: string; profile: { name: string } }
 * type ReadonlyUser = DeepReadonly<User>
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Omits multiple keys from a type
 * @example
 * type User = { id: string; name: string; email: string; password: string }
 * type PublicUser = OmitMultiple<User, 'password' | 'email'>
 * // { id: string; name: string }
 */
export type OmitMultiple<T, K extends keyof T> = Omit<T, K>;

/**
 * Picks multiple keys from a type
 * @example
 * type User = { id: string; name: string; email: string; password: string }
 * type UserCredentials = PickMultiple<User, 'email' | 'password'>
 * // { email: string; password: string }
 */
export type PickMultiple<T, K extends keyof T> = Pick<T, K>;

/**
 * Creates a type that is either A or B, but not both
 * @example
 * type Config = Either<{ mode: 'light' }, { mode: 'dark' }>
 */
export type Either<A, B> = (A & Partial<Record<keyof B, never>>) | (B & Partial<Record<keyof A, never>>);

/**
 * Utility to create branded types (nominal typing)
 * @example
 * type UserId = Brand<string, 'UserId'>
 * type CompanyId = Brand<string, 'CompanyId'>
 */
export type Brand<T, B> = T & { __brand: B };

/**
 * Type-safe object keys
 * Better than Object.keys which returns string[]
 */
export function typedKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

/**
 * Type-safe object entries
 * Better than Object.entries which loses type information
 */
export function typedEntries<T extends object>(
  obj: T
): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

/**
 * Type-safe object values
 * Better than Object.values which returns any[]
 */
export function typedValues<T extends object>(obj: T): T[keyof T][] {
  return Object.values(obj) as T[keyof T][];
}

/**
 * Creates an exhaustive switch statement checker
 * Ensures all cases are handled in union types
 * @example
 * type Status = 'active' | 'inactive' | 'pending'
 * function getStatusColor(status: Status) {
 *   switch(status) {
 *     case 'active': return 'green'
 *     case 'inactive': return 'red'
 *     case 'pending': return 'yellow'
 *     default: return assertNever(status) // TypeScript error if case missing
 *   }
 * }
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

/**
 * Type guard for checking if a value is not null or undefined
 */
export function isNotNullish<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Filters an array removing null and undefined values
 * With proper type narrowing
 */
export function filterNullish<T>(array: (T | null | undefined)[]): T[] {
  return array.filter(isNotNullish);
}
