import {
  ApproveAction,
  type App,
  type FormData,
  type FormDef,
  type WfTodo,
} from "@eimsnext/models";
import {
  appService,
  authService,
  formDataService,
  formDefService,
  systemService,
  wfTodoService,
  workflowService,
} from "@eimsnext/services";
import type { LoginRequest } from "@eimsnext/services";
import { ODataQueryRequest } from "@eimsnext/services";

const buildODataQuery = (filter?: string, skip = 0, top = 20, orderby?: string) => {
  const query = new ODataQueryRequest();
  query.$skip = skip;
  query.$top = top;

  if (filter) query.$filter = filter;
  if (orderby) query.$orderby = orderby;

  return query;
};

export const mobileAuthService = {
  login(request: LoginRequest) {
    return authService.login(request);
  },
  getCurrentUser() {
    return systemService.getCurrentUser();
  },
};

export const appServiceMobile = {
  getMyApps(): Promise<App[]> {
    return appService.query<App>();
  },
  get(appId: string): Promise<App> {
    return appService.get<App>(appId);
  },
};

export const formServiceMobile = {
  query(appId: string, skip = 0, top = 20): Promise<FormDef[]> {
    return formDefService.query<FormDef>(buildODataQuery(`appId eq '${appId}'`, skip, top, "sortIndex asc"));
  },
  get(formId: string): Promise<FormDef> {
    return formDefService.get<FormDef>(formId);
  },
};

export const formDataServiceMobile = {
  query(formId: string, skip = 0, top = 20): Promise<FormData[]> {
    return formDataService.dynamicQuery<FormData>({
      skip,
      take: top,
      filter: `formId eq '${formId}'`,
      sort: "createTime desc",
    });
  },
  count(formId: string): Promise<number> {
    return formDataService.dynamicCount(`formId eq '${formId}'`);
  },
  get(dataId: string): Promise<FormData> {
    return formDataService.get<FormData>(dataId);
  },
  post(formId: string, data: Record<string, unknown>): Promise<FormData> {
    return formDataService.post<FormData>({ formId, data } as never);
  },
  put(dataId: string, data: Record<string, unknown>): Promise<FormData> {
    return formDataService.put<FormData>(dataId, data as never);
  },
};

export const todoServiceMobile = {
  getCount(): Promise<number> {
    return wfTodoService.count();
  },
  query(appId?: string, skip = 0, top = 10): Promise<WfTodo[]> {
    return wfTodoService.query<WfTodo>(
      buildODataQuery(appId ? `appId eq '${appId}'` : undefined, skip, top, "approveNodeStartTime desc")
    );
  },
  get(taskId: string): Promise<WfTodo> {
    return wfTodoService.get<WfTodo>(taskId);
  },
  approve(dataId: string, action: ApproveAction, comment = "") {
    return workflowService.approve({ dataId, action, comment });
  },
};

export const workflowServiceMobile = {
  getMyStarted(appId?: string, skip = 0, top = 10): Promise<WfTodo[]> {
    return wfTodoService.dynamicQuery<WfTodo>({
      skip,
      take: top,
      filter: appId ? `appId eq '${appId}'` : undefined,
      sort: "createTime desc",
      scope: "started",
    });
  },
  getApproved(appId?: string, skip = 0, top = 10): Promise<WfTodo[]> {
    return wfTodoService.dynamicQuery<WfTodo>({
      skip,
      take: top,
      filter: appId ? `appId eq '${appId}'` : undefined,
      sort: "updateTime desc",
      scope: "approved",
    });
  },
  getCced(appId?: string, skip = 0, top = 10): Promise<WfTodo[]> {
    return wfTodoService.dynamicQuery<WfTodo>({
      skip,
      take: top,
      filter: appId ? `appId eq '${appId}'` : undefined,
      sort: "createTime desc",
      scope: "cced",
    });
  },
};
