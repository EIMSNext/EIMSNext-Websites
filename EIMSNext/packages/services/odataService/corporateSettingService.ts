import { ODataServiceBase } from "../interface";
import { CorporateSetting, CorporateSettingRequest } from "@eimsnext/models";

export class CorporateSettingService extends ODataServiceBase<CorporateSetting, CorporateSettingRequest> {
    protected modelName(): string {
        return "CorporateSetting";
    }

    /** 当前企业适用于普通用户的配置集合（如企业主题色）。 */
    current(): Promise<CorporateSetting[]> {
        return this.http().api.get<CorporateSetting[]>("/CorporateSetting/current");
    }
}

const corporateSettingService = new CorporateSettingService()
export { corporateSettingService }
