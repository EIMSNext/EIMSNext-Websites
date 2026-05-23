import { ServiceBase } from "../interface";

export interface ApplyJoinCorporateRequest {
  corpId: string;
}

export class CorpOnboardingService extends ServiceBase {
  applyJoinCorporate(data: ApplyJoinCorporateRequest): Promise<{ success: boolean }> {
    return this.http().api.post<{ success: boolean }>("/system/joincorp", data);
  }
}

const corpOnboardingService = new CorpOnboardingService();

export { corpOnboardingService };
