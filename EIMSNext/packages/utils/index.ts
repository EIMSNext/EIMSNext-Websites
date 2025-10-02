import type { IAppSetting } from "./appSetting";
import appSetting from "./appSetting";
import accessToken from "./http/token";
import {
  http,
  AccessToken,
  HttpRequest,
  HttpClient,
  AuthClient,
  ApiClient,
  ODataClient,
  PageResult,
  ContentType,
  ODataMetadata,
  HttpInterceptors,
} from "./http";
import type { HttpRequestConfig } from "./http";

export {
  is,
  isString,
  isFunction,
  isObject,
  deepMerge,
  Dictionary,
  uniqueId,
} from "./type";
export {
  http,
  appSetting,
  accessToken,
  HttpRequest,
  PageResult,
  ContentType,
  ODataMetadata,
  HttpRequestConfig,
  HttpInterceptors,
  IAppSetting,
  HttpClient,
  ApiClient,
  AuthClient,
  ODataClient,
  AccessToken,
};
