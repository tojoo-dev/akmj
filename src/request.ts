import type { KyInstance } from "ky";

import { AkmjHTTPError } from "./errors.js";
import { serialize } from "./serialize.js";
import type { AkmjQueryOptions } from "./types/client.js";
import { HttpMethod } from "./types/definition.js";
import { buildSearchParams, isObject, removeSlash } from "./utils.js";

const isServer = typeof FileList === "undefined";
const isReactNative =
  typeof navigator !== "undefined" && navigator.product === "ReactNative";

type AkmjRequestOptions = {
  body: any;
  method: "get" | "post" | "put" | "delete" | "patch" | "head";
  path: string;
  client: KyInstance;
  queryOptions?: AkmjQueryOptions;
};

export class AkmjRequest {
  #options: AkmjRequestOptions;

  constructor({ method, ...options }: AkmjRequestOptions) {
    this.#options = {
      ...options,
      method: method.toLowerCase() as Lowercase<HttpMethod>,
    };
  }

  /**
   * Check if the value is a file
   */
  #isFile(v: any) {
    if (isReactNative && isObject(v) && v["uri"]) return true;
    if (isServer) return v instanceof Blob;

    return v instanceof FileList || v instanceof File;
  }

  /**
   * Check if the object has a file inside it
   */
  #hasFile(obj: Record<string, any>) {
    if (!obj) return false;

    return Object.values(obj).some((val) => {
      if (Array.isArray(val)) return val.some(this.#isFile);
      return this.#isFile(val);
    });
  }

  async #makeRequest() {
    /**
     * If the body has a file, then we should move to multipart form data.
     */
    let key = "json";
    let body = this.#options.body;
    if (!(body instanceof FormData) && this.#hasFile(body)) {
      body = serialize(body, { indices: true });
      key = "body";
    } else if (body instanceof FormData) {
      key = "body";
    }

    /**
     * Make the request
     */
    const isGetOrHead = ["get", "head"].includes(this.#options.method);
    const response = await this.#options.client[this.#options.method](
      removeSlash(this.#options.path),
      {
        searchParams: buildSearchParams(
          this.#options.queryOptions?.query || {}
        ),
        [key]: !isGetOrHead ? body : undefined,
        ...this.#options.queryOptions,
      }
    );

    let data: any;
    let error: any;

    /**
     * Parse the response based on the content type
     */
    const responseType = response.headers.get("Content-Type")?.split(";")[0];
    if (responseType === "application/json") {
      data = await response.json();
      data = data?.data ? data?.data : data;
    } else if (responseType === "application/octet-stream") {
      data = await response.arrayBuffer();
    } else {
      data = await response.text();
    }

    /**
     * If the status code is not in the 200 range, we remove
     * the data and set the error
     */
    const status = response.status;
    if (!response.ok) {
      error = new AkmjHTTPError(response);
      if (
        typeof this.#options.queryOptions?.hooks?.transformError === "function"
      ) {
        this.#options.queryOptions?.hooks?.transformError(
          error as AkmjHTTPError
        );
      }
      data = undefined;
    }

    return { data, error, response, status };
  }

  /**
   * Make the request and return the response
   */
  then(resolve: any, reject: any) {
    return this.#unwrap().then(resolve, reject);
  }

  /**
   * Unwrap will returns `response.data` if the request is successful
   * and will throw an error if `response.error` is set.
   */
  async #unwrap() {
    const result = await this.#makeRequest();
    if (result.error) throw result.error;

    return result.data;
  }

  async wrap() {
    const result = await this.#makeRequest();
    return result;
  }
}
