import { AxiosHeaders } from "axios";
import { getAuthUrl } from "@eimsnext/utils";
import { ServiceBase } from "../interface";

export class AuthProfileService extends ServiceBase {
  sendPinCode(data: any) {
    return this.post("/auth/sendPinCode", data);
  }

  verifyIdentity(data: any) {
    return this.post("/auth/verifyIdentity", data);
  }

  changePassword(data: any) {
    return this.post("/auth/changePassword", data);
  }

  changePhone(data: any) {
    return this.post("/auth/changePhone", data);
  }

  changeEmail(data: any) {
    return this.post("/auth/changeEmail", data);
  }

  unbindPhone(data: any) {
    return this.post("/auth/unbindPhone", data);
  }

  unbindEmail(data: any) {
    return this.post("/auth/unbindEmail", data);
  }

  private post<T>(url: string, data: any) {
    return this.http().httpRequest.post<T>({
      url: getAuthUrl(url, false),
      data,
      headers: new AxiosHeaders(),
    });
  }
}

const authProfileService = new AuthProfileService();
export { authProfileService };
