import { MakeAkmjRequest, MakeAkmjResponse } from "./utils.js";

export interface AkmjDefinition {
  [key: string]: ApiDefinitionParent;
}

type LowercaseHttpMethod = "get" | "post" | "put" | "patch" | "head" | "delete";
export type HttpMethod = Uppercase<LowercaseHttpMethod> | LowercaseHttpMethod;

export type ApiDefinitionParent = {
  // Keys starting with `$` are handled separately
  [key in `$${string}`]?: ApiDefitionUnit;
} & {
  // Keys without `$` are treated recursively
  [key in Exclude<string, `$${string}`>]?:
    | ApiDefinitionParent
    | ApiDefitionUnit;
};

export type ApiDefitionUnit = {
  path: string;
  method: HttpMethod;
  types?: { request: any; response: Record<number, unknown> } | unknown;
  params?: string[];
};

export type MakeApiDefinition<
  Req extends object,
  Res extends object | boolean | string,
  HasSchema extends boolean = false
> = {
  request: MakeAkmjRequest<Req>;
  response: MakeAkmjResponse<Res, HasSchema>;
};
