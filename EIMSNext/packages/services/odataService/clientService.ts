import { ODataServiceBase } from "../interface";
import { Client, ClientCredentials, ClientRequest } from "@eimsnext/models";

/**
 * OAuth 客户端的 OData 服务；标准 CRUD 使用 ODataServiceBase，凭证动作走自定义端点。
 */
export class ClientService extends ODataServiceBase<Client, ClientRequest> {
  protected modelName(): string {
    return "Client";
  }

  /** 自定义端点：查看明文凭证（仅在 5 分钟缓存期内可拿到 clientSecret）。 */
  reveal(id: string): Promise<ClientCredentials> {
    return this.http().api.get<ClientCredentials>(`/Client/${id}/reveal`);
  }

  /** 自定义端点：生成新的 ClientSecret。 */
  generateSecret(id: string): Promise<ClientCredentials> {
    return this.http().api.post<ClientCredentials>(`/Client/${id}/generate-secret`, {});
  }
}

const clientService = new ClientService();
export { clientService };
