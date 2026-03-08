import { ServiceBase } from "../interface";
import { LoginRequest } from "../requestModel";

export class AuthService extends ServiceBase {
    login(request: LoginRequest) {
        return this.http().auth.login(request.username, request.password, request.grant_type)
    }
}

const authService = new AuthService()
export { authService }