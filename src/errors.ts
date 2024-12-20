import { KyResponse } from "ky";

export class AkmjHTTPError extends Error {
  constructor(public http: Awaited<KyResponse>) {
    super(http.statusText + "");
    this.name = "AkmjHTTPError";
  }
}
