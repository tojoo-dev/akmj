import { KyResponse } from "ky";

export class AkmjHTTPError extends Error {
  constructor(public http: Awaited<KyResponse>, public data: unknown) {
    super(http.statusText + "");
    this.name = "AkmjHTTPError";
    this.data = data;
  }
}
