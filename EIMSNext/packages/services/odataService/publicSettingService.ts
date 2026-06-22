import { ODataServiceBase } from "../interface";
import { PublicSetting, PublicSettingRequest } from "@eimsnext/models";

export class PublicSettingService extends ODataServiceBase<PublicSetting, PublicSettingRequest> {
    protected modelName(): string {
        return "PublicSetting";
    }

    current(): Promise<PublicSetting> {
        return this.http().api.get<PublicSetting>("/PublicSetting/current");
    }
}

const publicSettingService = new PublicSettingService()
export { publicSettingService }

