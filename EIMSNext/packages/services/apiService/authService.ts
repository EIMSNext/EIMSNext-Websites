import { LoginRequest, RegisterRequest, SendRegCodeRequest } from "../requestModel";
import { ServiceBase } from "../interface";

export class AuthService extends ServiceBase {
  login(request: LoginRequest) {
    return this.http().auth.login(request.username, request.password, request.grant_type);
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
}

const authService = new AuthService();
export { authService };
