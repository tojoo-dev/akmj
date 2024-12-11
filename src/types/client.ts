import type { Options as KyOptions } from "ky";
import type {
  ApiDefinition,
  ApiDefinitionParent,
  ApiDefitionUnit,
} from "./definition.js";
import type { MaybeArray } from "./utils.js";

/**
 * Options accepted by AKMJ
 */
export type ClientOptions<T extends ApiDefinition> = {
  baseUrl: string;
  api?: T;
} & RuangNakesQueryOptions;

export type RuangNakesOptions<T extends ApiDefinition> = Omit<
  ClientOptions<T>,
  "api" | "baseUrl"
> & {
  baseUrl?: string;
};

export type RuangNakesQueryOptions = Omit<
  KyOptions,
  "prefixUrl" | "body" | "json" | "method" | "searchParams"
> & { query?: QueryParameters };

export type QueryParameters = Record<
  string,
  MaybeArray<string | Date | number | boolean | null | undefined>
>;

// Make the `request` optional if it's undefined, null, or unknown
type OptionalRequest<Req> = Req extends never ? {} : Req;

// Construct `params` argument if required
type ParamsArgs<T extends ApiDefitionUnit> = T["params"] extends string[]
  ? T["params"][number] extends never // Check if `params` array is empty
    ? never
    : { [K in T["params"][number]]: string }
  : never;

type ConvertToPrimitive<T> = T extends StringConstructor
  ? string
  : T extends NumberConstructor
  ? number
  : T extends BooleanConstructor
  ? boolean
  : T extends { new (...items: infer U): T }
  ? ConvertToPrimitive<U>[]
  : T extends object
  ? { [K in keyof T]: ConvertToPrimitive<T[K]> }
  : T;

// Construct `queryParams` or `body` arguments based on HTTP method
type RestArgs<T extends ApiDefitionUnit> = T["method"] extends
  | "get"
  | "head"
  | "delete"
  ? [
      ...(T["types"] extends { request: never }
        ? []
        : [
            queryParams?: OptionalRequest<
              T["types"] extends { request: infer Req }
                ? ConvertToPrimitive<Req>
                : {}
            >
          ]),
      options?: RuangNakesQueryOptions
    ]
  : [
      body: T["types"] extends { request: never }
        ? never
        : OptionalRequest<
            T["types"] extends { request: infer Req }
              ? ConvertToPrimitive<Req>
              : {}
          >,
      options?: RuangNakesQueryOptions
    ];

export type RuangNakesClient<in out T extends Record<string, any>> = {
  [P in keyof T]: T[P] extends ApiDefinitionParent
    ? RuangNakesClient<T[P]>
    : T[P] extends ApiDefitionUnit
    ? (
        ...args: ParamsArgs<T[P]> extends never
          ? RestArgs<T[P]>
          : [params: ParamsArgs<T[P]>, ...rest: RestArgs<T[P]>]
      ) => ResponseOrUnwrap<
        T[P]["types"]["response"] extends Record<number, unknown>
          ? T[P]["types"]["response"]
          : {}
      >
    : never;
};

/**
 * Shape of the response returned by AKMJ
 */
export type RuangNakesResponse<Res extends Record<number, unknown>> =
  | {
      error: null;
      status: number;
      response: Response;
      data: Res[200];
    }
  | {
      data: null;
      status: number;
      response: Response;
      error: Exclude<keyof Res, 200> extends never
        ? { status: unknown; value: unknown }
        : {
            [Status in Exclude<keyof Res, 200>]: {
              status: Status;
              value: Res[Status];
            };
          }[Exclude<keyof Res, 200>];
    };

/**
 * Expose the response if awaited or the unwrap method that will return the data or throw an error
 */
export type ResponseOrUnwrap<Res extends Record<number, unknown>> = Promise<
  Res[200]
> & {
  wrap: () => Promise<RuangNakesResponse<Res>>;
};
