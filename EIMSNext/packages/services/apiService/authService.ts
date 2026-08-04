import {
  LoginRequest,
  RegisterRequest,
  SendRegCodeRequest,
} from "../requestModel";
import { ServiceBase } from "../interface";

export interface IntegrationAuthorizationUrlDto {
  type?: string;
  displayName?: string;
  enabled?: boolean;
  authorizationUrl?: string;
}

export class AuthService extends ServiceBase {
  login(request: LoginRequest) {
    return this.http().auth.login(
      request.username,
      request.password,
      request.grant_type
    );
  }

  logout() {
    return this.http().auth.post("/auth/logout", {});
  }

  sendRegCode(request: SendRegCodeRequest) {
    return this.http().auth.post("/auth/sendRegCode", request);
  }

  sendLoginCode(request: SendRegCodeRequest) {
    return this.http().auth.post("/auth/sendLoginCode", request);
  }

  register(request: RegisterRequest) {
    return this.http().auth.post("/auth/register", request);
  }
  
  async getIntegrationAuthorizationUrl(
    type: string,
    state: string
  ): Promise<IntegrationAuthorizationUrlDto> {
    const result = await this.http().auth.get<
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

const authService = new AuthService();
export { authService };
