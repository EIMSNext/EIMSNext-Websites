import { ServiceBase } from "../interface";

export class IdentityProfileService extends ServiceBase {
  sendPinCode(data: any) {
    return this.http().identity.post("/identity/sendPinCode", data);
  }

  verifyIdentity(data: any) {
    return this.http().identity.post("/identity/verifyIdentity", data);
  }

  changePassword(data: any) {
    return this.http().identity.post("/identity/changePassword", data);
  }

  changePhone(data: any) {
    return this.http().identity.post("/identity/changePhone", data);
  }

  changeEmail(data: any) {
    return this.http().identity.post("/identity/changeEmail", data);
  }

  unbindPhone(data: any) {
    return this.http().identity.post("/identity/unbindPhone", data);
  }

  unbindEmail(data: any) {
    return this.http().identity.post("/identity/unbindEmail", data);
  }
}

const identityProfileService = new IdentityProfileService();
export { identityProfileService };
