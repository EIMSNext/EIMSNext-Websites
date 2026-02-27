import { ServiceBase } from "../interface";
import { LoginModel } from "../requestModel";

export class AuthService extends ServiceBase {
    login(loginModel: LoginModel) {
        return this.http().auth.login(loginModel.username, loginModel.password, loginModel.grant_type)
    }
}

const authService = new AuthService()
export { authService }