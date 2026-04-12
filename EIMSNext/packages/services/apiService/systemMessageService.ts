import { DeleteBatch, SystemMessageReadRequest } from "@eimsnext/models";
import { ServiceBase } from "../interface";

export class SystemMessageApiService extends ServiceBase {
  read(data: SystemMessageReadRequest): Promise<any> {
    return this.http().api.post<any>("/SystemMessage/Read", data);
  }

  readBatch(data: DeleteBatch): Promise<any> {
    return this.http().api.post<any>("/SystemMessage/ReadBatch", data);
  }
}

const systemMessageApiService = new SystemMessageApiService();
export { systemMessageApiService };
