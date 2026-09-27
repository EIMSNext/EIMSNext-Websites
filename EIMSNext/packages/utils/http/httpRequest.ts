import type { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import axios from "axios";
import qs from "qs";
import { ContentType, HttpRequestConfig } from "./interface";
import accessToken from "./token";
import { bus } from "../eventBus";

export class HttpRequest {
  private static readonly inFlight = new Map<string, Promise<unknown>>();
  private axiosInstance: AxiosInstance;
  private currentPath: () => string = () => {
    if (typeof window === "undefined") return "/";

    const hash = window.location.hash;
    if (hash?.startsWith("#")) {
      return hash.slice(1) || "/";
    }

    return window.location.pathname + window.location.search;
  };
  private isHandling401 = false;

  constructor(config: HttpRequestConfig) {
    this.axiosInstance = axios.create(config);

    this.setupInterceptors(config);
  }

  setCurrentPathGetter(fn: () => string) {
    this.currentPath = fn;
  }

  getAxios(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * @description: 拦截器配置
   */
  private setupInterceptors(config: HttpRequestConfig) {
    // 全局拦截器
    this.axiosInstance.interceptors.request.use(
      (config: HttpRequestConfig) => {
        this.applyIdempotency(config);
        if (config.headers["Content-Type"] == ContentType.FORM_URLENCODED) {
          config.data = qs.stringify(config.data);
        }
        if (typeof config.headers.set === "function") {
          config.headers.set("X-Requested-With", "XMLHttpRequest");
        } else {
          config.headers["X-Requested-With"] = config.headers["X-Requested-With"] || "XMLHttpRequest";
        }
        // console.log("request config", config);
        //TODO：处理多语言
        return config;
      },
      (error: AxiosError) => {
        console.log("axios request error", error);

        if (error && config.interceptors?.errorHandler) {
          config.interceptors?.errorHandler(error);
        }

        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (res: AxiosResponse<any>) => {
        // console.log("axios response", res);

        return Promise.resolve(res);
      },
      (error: AxiosError) => {
        console.log("axios response error", error);

        if (error?.response?.status === 401 && !this.isAuthEndpoint(error.config?.url)) {
          this.handleUnauthorized();
        }

        const requestConfig = error.config as HttpRequestConfig | undefined;
        if (error && !requestConfig?.silentError && config.interceptors?.errorHandler) {
          config.interceptors?.errorHandler(error);
        }

        return Promise.reject(error);
      }
    );

    //配置的拦截器
    this.axiosInstance.interceptors.request.use(
      config.interceptors?.requestResolve,
      config.interceptors?.requestReject
    );
    this.axiosInstance.interceptors.response.use(
      config.interceptors?.responseResolve,
      config.interceptors?.responseReject
    );
  }

  request<T = any>(config: HttpRequestConfig) {
    if (config.token) {
      config.headers.Authorization = `Bearer ${config.token}`;
    } else if (config.withToken !== false) {
      const token = accessToken.get();
      // console.log("token", token);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }

    const method = (config.method || "GET").toUpperCase();
    const dedupeKey = this.getDedupeKey(config);
    const existing = dedupeKey ? HttpRequest.inFlight.get(dedupeKey) : undefined;
    if (existing) return existing as Promise<T>;

    const promise = new Promise<T>((resolve, reject) => {
      this.axiosInstance
        .request(config)
        .then((res) => {
          // console.log("http request res", res);
          let data = res.data;

          //处理业务错误
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
    if (dedupeKey) {
      HttpRequest.inFlight.set(dedupeKey, promise);
      promise.finally(() => HttpRequest.inFlight.delete(dedupeKey)).catch(() => undefined);
    }
    return promise;
  }

  private applyIdempotency(config: HttpRequestConfig) {
    const method = (config.method || "GET").toUpperCase();
    if (config.disableIdempotency || !["POST", "PUT", "PATCH", "DELETE"].includes(method)) return;
    const key = config.idempotencyKey || this.createIdempotencyKey();
    config.idempotencyKey = key;
    if (config.headers?.set) config.headers.set("Idempotency-Key", key);
    else {
      config.headers = config.headers || ({} as any);
      (config.headers as any)["Idempotency-Key"] = key;
    }
  }

  private getDedupeKey(config: HttpRequestConfig): string | undefined {
    const method = (config.method || "GET").toUpperCase();
    if (config.disableIdempotency || !["POST", "PUT", "PATCH", "DELETE"].includes(method)) return;
    return `${method}:${config.url || ""}:${this.stableSerialize(config.data)}`;
  }

  private stableSerialize(value: any): string {
    if (value == null || typeof value !== "object") return String(value ?? "");
    if ((typeof FormData !== "undefined" && value instanceof FormData) || (typeof Blob !== "undefined" && value instanceof Blob)) {
      return Object.prototype.toString.call(value);
    }
    if (Array.isArray(value)) return `[${value.map((v) => this.stableSerialize(v)).join(",")}]`;
    return `{${Object.keys(value).sort().map((k) => `${k}:${this.stableSerialize(value[k])}`).join(",")}}`;
  }

  private createIdempotencyKey(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  }

  get<T = any>(config: HttpRequestConfig) {
    return this.request<T>({ ...config, method: "GET" });
  }

  post<T = any>(config: HttpRequestConfig) {
    return this.request<T>({ ...config, method: "POST" });
  }

  put<T = any>(config: HttpRequestConfig) {
    return this.request<T>({ ...config, method: "PUT" });
  }

  patch<T = any>(config: HttpRequestConfig) {
    return this.request<T>({ ...config, method: "PATCH" });
  }

  delete<T = any>(config: HttpRequestConfig) {
    return this.request<T>({ ...config, method: "DELETE" });
  }

  // // support form-data Content-Type= application/x-www-form-urlencoded;charset=UTF-8
  // supportFormData(config: CustomAxiosRequestConfig) {
  //   const headers = config.headers;
  //   const contentType = headers?.["Content-Type"] || headers?.["content-type"];

  //   if (
  //     contentType !== ContentType.FORM_URLENCODED ||
  //     !Reflect.has(config, "data") ||
  //     config.method?.toUpperCase() === "GET"
  //   ) {
  //     return config;
  //   }

  //   return {
  //     ...config,
  //     data: qs.stringify(config.data, { arrayFormat: "brackets" }),
  //   };
  // }

  private isAuthEndpoint(url?: string): boolean {
    if (!url) return false;
    return /connect\/token|public\/challenge|public\/token|auth\/logout/i.test(url);
  }

  private handleUnauthorized() {
    if (this.isHandling401) return;
    this.isHandling401 = true;
    try {
      accessToken.clear();
      const path = this.currentPath();
      bus.emit("identity:logout", { reason: "401", path });
      if (typeof window !== "undefined" && path !== "/login" && !path.startsWith("/login?")) {
        const redirect = encodeURIComponent(path);
        window.location.assign(`/#/login?redirect=${redirect}`);
      }
    } catch (e) {
      console.error("401 handler error", e);
    } finally {
      // 跨请求保活:不清,避免再次进入
    }
  }
  // get<T = any>(
  //   config: CustomAxiosRequestConfig
  // ): Promise<[Error | AxiosError | undefined, ApiResult<T> | undefined]> {
  //   return this.request({ ...config, method: "GET" });
  // }

  // post<T = any>(
  //   config: CustomAxiosRequestConfig
  // ): Promise<[Error | AxiosError | undefined, ApiResult<T> | undefined]> {
  //   return this.request({ ...config, method: "POST" });
  // }

  // put<T = any>(
  //   config: CustomAxiosRequestConfig
  // ): Promise<[Error | AxiosError | undefined, ApiResult<T> | undefined]> {
  //   return this.request({ ...config, method: "PUT" });
  // }

  // patch<T = any>(
  //   config: CustomAxiosRequestConfig
  // ): Promise<[Error | AxiosError | undefined, ApiResult<T> | undefined]> {
  //   return this.request({ ...config, method: "PUT" });
  // }

  // delete<T = any>(
  //   config: CustomAxiosRequestConfig
  // ): Promise<[Error | AxiosError | undefined, ApiResult<T> | undefined]> {
  //   return this.request({ ...config, method: "DELETE" });
  // }
  // /*
  //  * @description:  上传文件
  //  */
  // upload<T = any>(config: CustomAxiosRequestConfig, params: UploadFileParams) {
  //   const formData = new window.FormData();
  //   const customFilename = params.name || "file";

  //   if (params.filename) {
  //     formData.append(customFilename, params.file, params.filename);
  //   } else {
  //     formData.append(customFilename, params.file);
  //   }

  //   if (params.data) {
  //     Object.keys(params.data).forEach((key) => {
  //       const value = params.data![key];
  //       if (Array.isArray(value)) {
  //         value.forEach((item) => {
  //           formData.append(`${key}[]`, item);
  //         });
  //         return;
  //       }

  //       formData.append(key, params.data![key]);
  //     });
  //   }

  //   return this.axiosInstance.request<T>({
  //     ...config,
  //     method: "POST",
  //     data: formData,
  //     headers: {
  //       "Content-type": ContentType.FORM_DATA,
  //       // @ts-ignore
  //       // ignoreCancelToken: true,
  //     },
  //   });
  // }

  // request<T = any>(
  //   config: CustomAxiosRequestConfig
  // ): Promise<[Error | AxiosError | undefined, T | undefined]> {
  //   config = this.supportFormData(config);

  //   return new Promise((resolve) => {
  //     this.axiosInstance
  //       .request<any, AxiosResponse<T>>(config)
  //       .then((res: AxiosResponse<T>) => {
  //         const response = res as unknown as T;
  //         resolve([undefined, response]);
  //       })
  //       .catch((e: Error | AxiosError) => {
  //         //   if (axios.isAxiosError(e)) {
  //         // rewrite error message from axios in here
  //         //   }
  //         resolve([e, undefined]);
  //       });
  //   });
  // }
}
