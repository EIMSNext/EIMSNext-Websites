import type { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import axios from "axios";
import qs from "qs";
import { ContentType, HttpRequestConfig } from "./interface";
import accessToken from "./token";

export class HttpRequest {
  private axiosInstance: AxiosInstance;

  constructor(config: HttpRequestConfig) {
    this.axiosInstance = axios.create(config);

    this.setupInterceptors(config);
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
        if (config.headers["Content-Type"] == ContentType.FORM_URLENCODED) {
          config.data = qs.stringify(config.data);
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

        if (error && config.interceptors?.errorHandler) {
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
    if (config.withToken !== false) {
      const token = accessToken.get();
      // console.log("token", token);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }

    return new Promise<T>((resolve, reject) => {
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
