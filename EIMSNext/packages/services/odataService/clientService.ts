import { ODataServiceBase } from "../interface";
import { Client, ClientCredentials, ClientRequest } from "@eimsnext/models";

/**
 * OAuth 客户端的 OData 服务。
 *
 * 注意：OData CRUD 中 <c>clientSecrets</c> 被后端 EDM Ignore，PATCH/PUT 改不动 secret；
 * 创建/生成走自定义端点（<c>create()</c>、<c>generateSecret()</c>、<c>generateApiKey()</c>）。
 */
export class ClientService extends ODataServiceBase<Client, ClientRequest> {
  protected modelName(): string {
    return "Client";
  }

  /** 自定义端点：创建。生成 ClientId + ClientSecret + ApiKey，返回明文一次。 */
  create(req: ClientRequest): Promise<ClientCredentials> {
    return this.http().api.post<ClientCredentials>(`/Client`, req);
  }

  /** 自定义端点：完整更新（read-modify-write 保护 secret）。 */
  updateById(id: string, req: ClientRequest): Promise<Client> {
    return this.http().api.put<Client>(`/Client/${id}`, req);
  }

  /** 自定义端点：查看明文凭证（仅在 5 分钟缓存期内可拿到 clientSecret）。 */
  reveal(id: string): Promise<ClientCredentials> {
    return this.http().api.get<ClientCredentials>(`/Client/${id}/reveal`);
  }

  /** 自定义端点：生成新的 ClientSecret。 */
  generateSecret(id: string): Promise<ClientCredentials> {
    return this.http().api.post<ClientCredentials>(`/Client/${id}/generate-secret`, {});
  }

  /** 自定义端点：生成新的 ApiKey。 */
  generateApiKey(id: string): Promise<ClientCredentials> {
    return this.http().api.post<ClientCredentials>(`/Client/${id}/generate-api-key`, {});
  }
}

const clientService = new ClientService();
export { clientService };
