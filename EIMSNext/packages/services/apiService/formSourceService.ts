import { IFormMemberSourceItem, IFormMemberSourceRequest } from "../requestModel";
import { ServiceBase } from "../interface/serviceBase";

export class FormSourceService extends ServiceBase {
  employeesPage(request: IFormMemberSourceRequest): Promise<IFormMemberSourcePage> {
    return this.http().api.post<IFormMemberSourcePage>("/FormSource/employees", request);
  }

  employees(request: IFormMemberSourceRequest): Promise<IFormMemberSourceItem[]> {
    return this.employeesPage(request)
      .then((page) => page.value || []);
  }

  departmentsPage(request: IFormMemberSourceRequest): Promise<IFormMemberSourcePage> {
    return this.http().api.post<IFormMemberSourcePage>("/FormSource/departments", request);
  }

  departments(request: IFormMemberSourceRequest): Promise<IFormMemberSourceItem[]> {
    return this.departmentsPage(request)
      .then((page) => page.value || []);
  }
}

export interface IFormMemberSourcePage {
  value: IFormMemberSourceItem[];
  hasMore: boolean;
}

const formSourceService = new FormSourceService();
export { formSourceService };
