import { getAuthUrl } from "@eimsnext/utils";
import { ServiceBase } from "../interface";

export class AuthProfileService extends ServiceBase {
  sendPinCode(data: any) {
    return this.http().auth.post("/auth/sendPinCode", data);
  }

  verifyIdentity(data: any) {
    return this.http().auth.post("/auth/verifyIdentity", data);
  }

  changePassword(data: any) {
    return this.http().auth.post("/auth/changePassword", data);
  }

  changePhone(data: any) {
    return this.http().auth.post("/auth/changePhone", data);
  }

  changeEmail(data: any) {
    return this.http().auth.post("/auth/changeEmail", data);
  }

  unbindPhone(data: any) {
    return this.http().auth.post("/auth/unbindPhone", data);
  }

  unbindEmail(data: any) {
    return this.http().auth.post("/auth/unbindEmail", data);
  }
}

const authProfileService = new AuthProfileService();
export { authProfileService };
