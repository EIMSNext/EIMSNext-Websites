import { LoginRequest, RegisterRequest, SendRegCodeRequest } from "../requestModel";
import { ServiceBase } from "../interface";

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
}

const identityService = new IdentityService();
export { identityService };
