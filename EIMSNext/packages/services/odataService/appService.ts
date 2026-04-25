import { ODataServiceBase } from "../interface";
import {
  App,
  AppRequest,
  CreateAppGroupRequest,
  DeleteAppGroupRequest,
  EditAppGroupRequest,
  EditAppMenuRequest,
  SaveAppMenusRequest,
} from "@eimsnext/models";

export class AppService extends ODataServiceBase<App, AppRequest> {
    protected modelName(): string {
        return "App";
    }

    editMenu(data: EditAppMenuRequest): Promise<App> {
        return this.http().api.post<App>(`/App/EditMenu`, data);
    }

    createGroup(data: CreateAppGroupRequest): Promise<App> {
        return this.http().api.post<App>(`/App/CreateGroup`, data);
    }

    editGroup(data: EditAppGroupRequest): Promise<App> {
        return this.http().api.post<App>(`/App/EditGroup`, data);
    }

    deleteGroup(data: DeleteAppGroupRequest): Promise<App> {
        return this.http().api.post<App>(`/App/DeleteGroup`, data);
    }

    saveMenus(data: SaveAppMenusRequest): Promise<App> {
        return this.http().api.post<App>(`/App/SaveMenus`, data);
    }
}

const appService = new AppService()
export { appService }

