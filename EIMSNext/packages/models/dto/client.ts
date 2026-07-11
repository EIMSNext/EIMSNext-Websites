import { CorpModelBase, IdBase } from "./modelBase";

/**
 * OAuth 客户端（开放平台 API Key）。
 * 后端 OData 不返回前端不应操作的敏感字段；明文 secret 只能通过 reveal / generate-secret 端点取得。
 */
export interface Client extends CorpModelBase {
  name?: string;
  enabled: boolean;
}

/** 创建 / 编辑 Client 的请求体。 */
export interface ClientRequest extends IdBase {
  name?: string;
  enabled?: boolean;
}

/** 查看 / 重新生成后返回的明文凭证。 */
export interface ClientCredentials {
  clientId: string;
  clientSecret: string;
}
