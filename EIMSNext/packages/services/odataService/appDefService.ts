import { ODataServiceBase } from "../interface";
import {
  AppDef,
  AppDefRequest,
  CreateAppGroupRequest,
  DeleteAppGroupRequest,
  EditAppGroupRequest,
  EditAppMenuRequest,
  SaveAppMenusRequest,
} from "@eimsnext/models";

export class AppDefService extends ODataServiceBase<AppDef, AppDefRequest> {
  protected modelName(): string {
    return "AppDef";
  }

  editMenu(data: EditAppMenuRequest): Promise<AppDef> {
    return this.http().api.post<AppDef>(`/AppDef/EditMenu`, data);
  }

  createGroup(data: CreateAppGroupRequest): Promise<AppDef> {
    return this.http().api.post<AppDef>(`/AppDef/CreateGroup`, data);
  }

  editGroup(data: EditAppGroupRequest): Promise<AppDef> {
    return this.http().api.post<AppDef>(`/AppDef/EditGroup`, data);
  }

  deleteGroup(data: DeleteAppGroupRequest): Promise<AppDef> {
    return this.http().api.post<AppDef>(`/AppDef/DeleteGroup`, data);
  }

  saveMenus(data: SaveAppMenusRequest): Promise<AppDef> {
    return this.http().api.post<AppDef>(`/AppDef/SaveMenus`, data);
  }
}

const appDefService = new AppDefService();
export { appDefService };
