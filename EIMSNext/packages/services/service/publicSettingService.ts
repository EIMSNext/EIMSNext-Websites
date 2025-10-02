import { ODataServiceBase } from "../interface";
import { PublicSetting, PublicSettingRequest } from "@eimsnext/models";

export class PublicSettingService extends ODataServiceBase<PublicSetting, PublicSettingRequest> {
    protected modelName(): string {
        return "PublicSetting";
    }
}

const publicSettingService = new PublicSettingService()
export { publicSettingService }

