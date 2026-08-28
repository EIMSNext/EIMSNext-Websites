import { LoginRequest, RegisterRequest, SendRegCodeRequest } from "../requestModel";
import { ServiceBase } from "../interface";

export interface IntegrationAuthorizationUrlDto {
  type?: string;
  displayName?: string;
  enabled?: boolean;
  authorizationUrl?: string;
}

export class IdentityService extends ServiceBase {
  login(request: LoginRequest) {
    return this.http().identity.login(request.username, request.password, request.grant_type);
  }

  logout() {
    return this.http().identity.post("/identity/logout", {});
  }

  sendRegCode(request: SendRegCodeRequest) {
    return this.http().identity.post("/identity/sendRegCode", request);
  }

  sendLoginCode(request: SendRegCodeRequest) {
    return this.http().identity.post("/identity/sendLoginCode", request);
  }

  register(request: RegisterRequest) {
    return this.http().identity.post("/identity/register", request);
  }

  async getIntegrationAuthorizationUrl(
    type: string,
    state: string,
  ): Promise<IntegrationAuthorizationUrlDto> {
    const result = await this.http().identity.get<
      IntegrationAuthorizationUrlDto & {
        AuthorizationUrl?: string;
        DisplayName?: string;
        Enabled?: boolean;
        Type?: string;
      }
    >("/open/integration/authorize", { type, state }, false);

    return {
      type: result.type ?? result.Type,
      displayName: result.displayName ?? result.DisplayName,
      enabled: result.enabled ?? result.Enabled,
      authorizationUrl: result.authorizationUrl ?? result.AuthorizationUrl,
    };
  }
}

const identityService = new IdentityService();
export { identityService };
