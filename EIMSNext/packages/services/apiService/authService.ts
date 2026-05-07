import { LoginRequest } from "../requestModel";
import { ServiceBase } from "../interface";

export class AuthService extends ServiceBase {
  login(request: LoginRequest) {
    return this.http().auth.login(request.username, request.password, request.grant_type);
  }
}

const authService = new AuthService();
export { authService };
