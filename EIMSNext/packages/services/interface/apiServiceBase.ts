import { IdBase } from "@eimsnext/models";
import { BatchDeleteModel } from "../requestModel";
import { ServiceBase } from "./serviceBase";

export abstract class ApiServiceBase<T = IdBase, R = any> extends ServiceBase {
  protected abstract modelName(): string;

  dynamicCount(query?: any): Promise<number> {
    let url = this.getUrl(this.modelName(), "dynamic/count");
    return this.http().api.count(url, query);
  }

  dynamicQuery<T>(query?: any): Promise<T[]> {
    let url = this.getUrl(this.modelName(), "dynamic/query");
    return this.http().api.query(url, query);
  }

  get<T>(id: string, query?: any): Promise<T> {
    let url = this.getUrl(this.modelName(), id);
    return this.http().api.get<T>(url, query);
  }

  count(query?: any): Promise<number> {
    let url = this.getUrl(this.modelName(), "$count");
    return this.http().api.count(url, query);
  }

  query<T>(query?: any): Promise<T[]> {
    let url = this.getUrl(this.modelName(), "$query");
    return this.http().api.query(url, query);
  }

  post<T>(data: R): Promise<T> {
    let url = this.getUrl(this.modelName());
    return this.http().api.post<T>(url, data);
  }

  put<T>(id: string, data: R): Promise<T> {
    let url = this.getUrl(this.modelName(), id);
    return this.http().api.put<T>(url, data);
  }

  patch<T>(id: string, data: R): Promise<T> {
    let url = this.getUrl(this.modelName(), id);
    return this.http().api.patch<T>(url, data);
  }

  delete<T>(id: string, data?: BatchDeleteModel) {
    let url = this.getUrl(this.modelName(), id);
    return this.http().api.delete<T>(url, data);
  }

  private getUrl<T>(url: string, id?: string) {
    let idPath = id ? "/" + id : "";
    url = url.startsWith("/") ? url : "/" + url;
    return url.startsWith("http") ? url : `${url}${idPath}`;
  }
}
