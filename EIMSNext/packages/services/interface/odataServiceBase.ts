import { IdBase } from "@eimsnext/models";
import { BatchDeleteModel, ODataQueryModel } from "../requestModel";
import { ServiceBase } from "./serviceBase";

export abstract class ReadonlyODataServiceBase<T = IdBase> extends ServiceBase {
  protected abstract modelName(): string;

  get<T>(id: string, query?: ODataQueryModel | string): Promise<T> {
    return this.http().odata.get<T>(this.modelName(), id, query);
  }

  count(query?: ODataQueryModel | string): Promise<number> {
    return this.http().odata.count(this.modelName(), query);
  }

  query<T>(query?: ODataQueryModel | string): Promise<T[]> {
    return this.http().odata.query(this.modelName(), query);
  }
}

export abstract class ODataServiceBase<
  T = IdBase,
  R = any
> extends ServiceBase {
  protected abstract modelName(): string;

  get<T>(id: string, query?: ODataQueryModel | string): Promise<T> {
    return this.http().odata.get<T>(this.modelName(), id, query);
  }

  count(query?: ODataQueryModel | string): Promise<number> {
    return this.http().odata.count(this.modelName(), query);
  }

  query<T>(query?: ODataQueryModel | string): Promise<T[]> {
    return this.http().odata.query(this.modelName(), query);
  }

  post<T>(data: R): Promise<T> {
    return this.http().odata.post<T>(this.modelName(), data);
  }

  put<T>(id: string, data: R): Promise<T> {
    return this.http().odata.put<T>(this.modelName(), id, data);
  }

  patch<T>(id: string, data: R): Promise<T> {
    return this.http().odata.patch<T>(this.modelName(), id, data);
  }

  delete<T>(id: string, data?: BatchDeleteModel) {
    return this.http().odata.delete<T>(this.modelName(), id, data);
  }
}
