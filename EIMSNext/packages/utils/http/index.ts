import { AccessToken } from "./token";
import accessToken from "./token";
import { HttpRequest } from "./httpRequest";
import { HttpClient } from "./httpClient";
import { IdentityClient } from "./identityClient";
import { ApiClient } from "./apiClient";
import { ODataClient } from "./odataClient";
import { UploadClient } from "./uploadClient";
import http from "./httpClient";
import {
  PageResult,
  ContentType,
  ODataMetadata,
  HttpInterceptors,
} from "./interface";
import type { HttpRequestConfig } from "./interface";
import { setupHttp } from "./setupHttp";
import { buildCallbackUrl, buildPortalAuthUrl, consumeCallbackCode, LOCAL_AUTH_CODE_PREFIX, redirectToPortalLogout, withLocalAuthCodePrefix } from "./callbackToken";
export { useSubmitGuard } from "../useSubmitGuard";

export {
  http,
  accessToken,
  AccessToken,
  HttpRequest,
  HttpClient,
  IdentityClient,
  ApiClient,
  ODataClient,
  UploadClient,
  PageResult,
  ContentType,
  ODataMetadata,
  HttpInterceptors,
  HttpRequestConfig,
  setupHttp,
  buildCallbackUrl,
  buildPortalAuthUrl,
  consumeCallbackCode,
  LOCAL_AUTH_CODE_PREFIX,
  withLocalAuthCodePrefix,
  redirectToPortalLogout,
};
