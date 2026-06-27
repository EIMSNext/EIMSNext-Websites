import { CorpModelBase, IdBase } from "./modelBase";

/**
 * OAuth 客户端（开放平台 API Key）。
 * 后端 OData 不会返回 clientSecrets；明文只能通过 create / generate-secret 端点取得一次。
 */
export interface Client extends CorpModelBase {
  clientId: string;
  clientName?: string;
  enabled: boolean;
  requireClientSecret: boolean;
  apiKey: string;
  allowedGrantTypes: string[];
  allowedScopes: string[];
  identityTokenLifetime: number;
  accessTokenLifetime: number;
  clientSecrets?: ClientSecret[];   // OData 响应中通常为空（被 Ignore）
}

export interface ClientSecret {
  description?: string;
  expiration?: string;
  type: "SharedSecret";
}

/** 创建 / 编辑 Client 的请求体（不含 clientSecrets/ClientId/ApiKey）。 */
export interface ClientRequest extends IdBase {
  clientName?: string;
  enabled: boolean;
  requireClientSecret: boolean;
  allowedGrantTypes: string[];
  allowedScopes: string[];
  identityTokenLifetime: number;
  accessTokenLifetime: number;
}

/** 创建 / 重新生成后返回的明文凭证。 */
export interface ClientCredentials {
  clientId: string;
  clientSecret: string;
  apiKey: string;
}
