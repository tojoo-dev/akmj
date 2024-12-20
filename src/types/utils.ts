export type MaybeArray<T> = T | T[];

/**
 * @see https://github.com/ianstormtaylor/superstruct/blob/7973400cd04d8ad92bbdc2b6f35acbfb3c934079/src/utils.ts#L323-L325
 */
export type Simplify<TType> = TType extends any[] | Date
  ? TType
  : { [K in keyof TType]: Simplify<TType[K]> };

type JsonPrimitive =
  | string
  | number
  | boolean
  | string
  | number
  | boolean
  | null;

type NonJsonPrimitive = undefined | Function | symbol;

type IsAny<T> = 0 extends 1 & T ? true : false;

type ReactNativeFile = { uri: string; type: string; name: string };

type FilterKeys<TObj extends object, TFilter> = {
  [TKey in keyof TObj]: TObj[TKey] extends TFilter ? TKey : never;
}[keyof TObj];

/**
 * Convert a type to a JSON-serialized version of itself
 *
 * This is useful when sending data from client to server, as it ensure the
 * resulting type will match what the client will receive after JSON serialization.
 */
export type Serialize<T> = IsAny<T> extends true
  ? any
  : T extends JsonPrimitive | undefined
  ? T
  : T extends Map<any, any> | Set<any>
  ? Record<string, never>
  : T extends NonJsonPrimitive
  ? never
  : T extends { toJSON(): infer U }
  ? U
  : T extends []
  ? []
  : T extends [unknown, ...unknown[]]
  ? SerializeTuple<T>
  : T extends ReadonlyArray<infer U>
  ? (U extends NonJsonPrimitive ? null : Serialize<U>)[]
  : T extends object
  ? T extends { [key: string]: JsonPrimitive }
    ? T
    : SerializeObject<T>
  : never;

/** JSON serialize [tuples](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types) */
type SerializeTuple<T extends [unknown, ...unknown[]]> = {
  [k in keyof T]: T[k] extends NonJsonPrimitive ? null : Serialize<T[k]>;
};

/** JSON serialize objects (not including arrays) and classes */
type SerializeObject<T extends object> = {
  [k in keyof Omit<T, FilterKeys<T, NonJsonPrimitive>>]: Serialize<T[k]>;
};

/**
 * Make all undefined properties optional in an object
 *
 * @example
 * type Foo = { a: string, b: number | undefined, c: boolean }
 * type Bar = MakeOptional<Foo> // { a: string, b?: number, c: boolean }
 */
export type MakeOptional<T extends object> = UndefinedProps<T> &
  Omit<T, keyof UndefinedProps<T>>;

type UndefinedProps<T extends object> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K];
};

/**
 * Convert a Controller Return Type to a Record of status/response
 *
 * @example
 * type Response = { __status: 200, __response: { foo: string } } | { __status: 400, __response: { error: string } }
 * type ResponseRecord = ConvertReturnTypeToRecordStatusResponse<Response>
 * // ^? { 200: { foo: string }, 400: { error: string } }
 */
export type ConvertReturnTypeToRecordStatusResponse<T> = {
  [P in T as P extends { __status: infer S extends number }
    ? S
    : 200]: P extends {
    __response: infer R;
  }
    ? R
    : P;
};

/**
 * Shortcut for computing the AKMJ response type
 */
export type MakeAkmjResponse<
  T extends object | boolean | string,
  HasSchema extends boolean = false
> = Simplify<Serialize<ConvertReturnTypeToRecordStatusResponse<Awaited<T>>>> &
  (HasSchema extends true
    ? { 422: { errors: { message: string; rule: string; field: string }[] } }
    : {});

/**
 * Shortcut for computing the AKMJ request type
 *
 * Also Remap MultipartFile to Blob | File | ReactNativeFile
 */
export type MakeAkmjRequest<T extends object> = MakeOptional<{
  [K in keyof T]: T[K] extends FileList ? Blob | File | ReactNativeFile : T[K];
}>;
