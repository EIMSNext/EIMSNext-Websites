import type {
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";

export enum ContentType {
  JSON = "application/json;charset=UTF-8",
  FORM_URLENCODED = "application/x-www-form-urlencoded;charset=UTF-8",
  FORM_DATA = "multipart/form-data;charset=UTF-8",
  TEXT_PLAIN = "text/plain;charset=UTF-8",
}

export enum ODataMetadata {
  None = "application/json;odata.metadata=none",
  Minimal = "application/json;odata.metadata=minimal",
  Full = "application/json;odata.metadata=full",
}

export class PageResult<T = any> {
  value: T[] = [];
}

export class HttpInterceptors<T = AxiosResponse> {
  requestResolve?: (config: HttpRequestConfig) => HttpRequestConfig;
  requestReject?: (err: any) => any;
  responseResolve?: (res: T) => T;
  responseReject?: (err: any) => any;
  errorHandler?: (msg: AxiosError | string | undefined) => void;
}

export interface HttpRequestConfig<T = AxiosResponse>
  extends InternalAxiosRequestConfig {
  withToken?: boolean;
  /** Suppress the global error notification when the caller renders the error state itself. */
  silentError?: boolean;
  /**
   * 自定义 token 覆盖。设置后优先使用此 token，不读取全局 accessToken。
   * 用于公开页面等需要页面级 token 隔离的场景。
   */
  token?: string;
  interceptors?: HttpInterceptors<T>;
}

// declare type Recordable<T = any> = Record<string, T>;

// // multipart/form-data: upload file
// export interface UploadFileParams {
//   data?: Recordable;
//   // File parameter interface field name
//   name?: string;
//   // 文件
//   file: File | Blob;
//   // 文件名
//   filename?: string;
//   [key: string]: any;
// }
