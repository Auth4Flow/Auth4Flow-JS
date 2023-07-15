const PACKAGE_VERSION = require("../package.json").version;
import { API_URL_BASE } from "./constants";
import ApiError from "./types/ApiError";
import Config from "./types/Config";

interface HttpClient {
  get(requestOptions: HttpClientRequestOptions): Promise<any>;
  post(requestOptions: HttpClientRequestOptions): Promise<any>;
}

export interface HttpClientRequestOptions {
  sessionToken?: string;
  baseUrl?: string;
  data?: any;
  params?: any;
  url: string;
}

interface RequestHeaders {
  [header: string]: string;
}

export default class ApiClient implements HttpClient {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  public setSessionToken(token: string) {
    this.config.sessionToken = token;
  }

  public async get(requestOptions: HttpClientRequestOptions): Promise<any> {
    const [requestUrl, requestHeaders] =
      this.buildRequestUrlAndHeaders(requestOptions);
    /* @ts-ignore */
    const response = await fetch(requestUrl, {
      method: "GET",
      headers: requestHeaders,
    });
    if (!response.ok) {
      throw this.buildError(await response.json());
    }

    return await response.json();
  }

  public async post(requestOptions: HttpClientRequestOptions): Promise<any> {
    const [requestUrl, requestHeaders] =
      this.buildRequestUrlAndHeaders(requestOptions);
    /* @ts-ignore */
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(requestOptions.data),
    });

    if (!response.ok) {
      throw this.buildError(await response.json());
    }

    return await response.json();
  }

  private buildRequestUrlAndHeaders(
    requestOptions?: HttpClientRequestOptions
  ): [string, RequestHeaders] {
    let baseUrl = this.config.endpoint || API_URL_BASE;
    const headers = {
      "Content-Type": "application/json",
      "User-Agent": `Forge4Flow-JS/${PACKAGE_VERSION}`,
      Authorization: `None None`,
    };

    if (this.config.sessionToken) {
      headers["Authorization"] = `Bearer ${this.config.sessionToken}`;
    }

    if (requestOptions?.sessionToken) {
      headers["Authorization"] = `Bearer ${requestOptions.sessionToken}`;
    }

    if (requestOptions?.baseUrl) {
      baseUrl = requestOptions.baseUrl;
    }

    return [`${baseUrl}${requestOptions.url}`, headers];
  }

  private buildError(errorResponse: any): Error {
    return new ApiError(errorResponse.code, errorResponse.message);
  }
}
