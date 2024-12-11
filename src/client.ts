import { KyInstance } from "ky";
import { pathGetter } from "./utils.js";

import ky from "ky";
import { AkmjRequest } from "./request.js";
import { AkmjClient, ClientOptions } from "./types/client.js";
import { AkmjDefinition } from "./types/definition.js";

const methods = ["get", "post", "put", "delete", "patch", "head"] as const;
const prefixedMethods = methods.map((method) => `$${method}`);
const queryOptKey = [
  "cache",
  "credentials",
  "fetch",
  "headers",
  "hooks",
  "integrity",
  "keepalive",
  "mode",
  "onDownloadProgress",
  "parseJson",
  "priority",
  "query",
  "redirect",
  "referrer",
  "referrerPolicy",
  "retry",
  "signal",
  "stringifyJson",
  "throwHttpErrors",
  "timeout",
  "window",
];

const createProxy = (options: {
  client: KyInstance;
  baseUrl: string;
  config: any;
  paths?: string[];
}): any => {
  const { client, config, paths = [] } = options;

  const getApiRoute = pathGetter(config?.api);
  return new Proxy(() => {}, {
    get(_, param: string) {
      return createProxy({ ...options, paths: [...paths, param] });
    },

    apply(_, __, [paramsOrBody, bodyOrOption, queryOptions]) {
      const lastPath = paths.at(-1);
      if (paths[0] === "rpc") {
        /**
         * Then, check if it's a route parameter call like `client.users({ id: 1 })`
         */
        const isMethodCall =
          prefixedMethods.includes(lastPath as any) ||
          lastPath?.startsWith("$");
        if (!isMethodCall && typeof paramsOrBody === "object") {
          return createProxy({
            ...queryOptions,
            paths: [...paths, Object.values(paramsOrBody)[0] as string],
          });
        }

        /**
         * Otherwise, it's time to make the final request.
         */
        const method = paths[paths.length - 1]?.slice(
          1
        ) as (typeof methods)[number];

        const isGetOrHead = ["get", "head"].includes(method);
        return new AkmjRequest({
          body: paramsOrBody,
          client,
          method,
          path: paths.slice(1, -1).join("/"),
          queryOptions: isGetOrHead ? paramsOrBody : bodyOrOption,
        });
      }

      const currentRoutePath: any = getApiRoute(paths);
      if (!currentRoutePath) {
        throw new TypeError(`${paths.join(".")} route path not found`);
      }

      if (!lastPath?.startsWith("$")) {
        return createProxy({ ...options, paths: [...paths, paramsOrBody] });
      }

      const method = currentRoutePath.method;
      const isGetOrHead = ["get", "head"].includes(method);

      let path = currentRoutePath.path;
      let body;
      let qOption;
      if (currentRoutePath.params?.length > 0) {
        const params = paramsOrBody as any;
        // @ts-expect-error
        path = path.replace(/:(\w+)/g, (_, key) => params[key]);
        body = bodyOrOption;
      } else {
        body = paramsOrBody;
        qOption = bodyOrOption;
      }

      const isBodyIsOptions =
        body &&
        typeof body === "object" &&
        Object.keys(body).some((key) => queryOptKey.includes(key));

      if (isBodyIsOptions) {
        qOption = body;
        body = {};
      }

      return new AkmjRequest({
        body,
        client,
        method: currentRoutePath.method,
        path,
        queryOptions: isGetOrHead ? { query: body, ...qOption } : qOption,
      });
    },
  });
};

export const createClient = <const Api extends AkmjDefinition>(
  options: ClientOptions<Api>
): AkmjClient<Api> => {
  const { api: _, ...restOpt } = options;
  const baseUrl = options.baseUrl;
  const client = ky.create({
    prefixUrl: baseUrl,
    throwHttpErrors: false,
    ...restOpt,
  });

  return createProxy({ client, baseUrl, config: { ...options } });
};
