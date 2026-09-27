import { ODataServiceBase } from "../interface";
import { WorkbenchFavorite, WorkbenchFavoriteRequest } from "@eimsnext/models";

export class WorkbenchFavoriteService extends ODataServiceBase<WorkbenchFavorite, WorkbenchFavoriteRequest> {
  protected modelName(): string {
    return "WorkbenchFavorite";
  }
}

const workbenchFavoriteService = new WorkbenchFavoriteService();
export { workbenchFavoriteService };
