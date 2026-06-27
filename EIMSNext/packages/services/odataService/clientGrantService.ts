import { ODataServiceBase } from "../interface";
import { ClientGrant, ClientGrantRequest } from "@eimsnext/models";

/**
 * 客户端授权的 OData 服务。
 * 标准 CRUD + 工具方法。
 */
export class ClientGrantService extends ODataServiceBase<ClientGrant, ClientGrantRequest> {
  protected modelName(): string {
    return "ClientGrant";
  }

  /** 按 ClientId 查 corp 范围内生效的授权。 */
  byClientId(clientId: string): Promise<ClientGrant | null> {
    return this.http().odata
      .query<ClientGrant>(`?$filter=clientId eq '${encodeURIComponent(clientId)}'`)
      .then((arr) => arr[0] ?? null)
      .catch(() => null);
  }
}

const clientGrantService = new ClientGrantService();
export { clientGrantService };
