import { ODataServiceBase } from "../interface";
import { Corporate, CorporateRequest } from "@eimsnext/models";

export class CorporateService extends ODataServiceBase<Corporate, CorporateRequest> {
    protected modelName(): string {
        return "Corporate";
    }

    get<T>(id: string, query?: any, options?: { silentError?: boolean }): Promise<T> {
        return this.http().odata.get<T>(this.modelName(), id, query, options);
    }

    query<T>(query?: any): Promise<T[]> {
        return this.http().odata.query<T>(this.modelName(), query);
    }

    post<T>(data: CorporateRequest): Promise<T> {
        return this.http().odata.post<T>(this.modelName(), data);
    }

    put<T>(id: string, data: CorporateRequest): Promise<T> {
        return this.http().odata.put<T>(this.modelName(), id, data);
    }

    patch<T>(id: string, data: CorporateRequest): Promise<T> {
        return this.http().odata.patch<T>(this.modelName(), id, data);
    }

    delete<T>(id: string, data?: any): Promise<T> {
        return this.http().odata.delete<T>(this.modelName(), id, data);
    }
}

const corporateService = new CorporateService()
export { corporateService }

