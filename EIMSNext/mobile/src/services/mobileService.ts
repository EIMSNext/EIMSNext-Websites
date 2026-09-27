import {
  DataAction,
  ApproveAction,
  type AppDef,
  type FormData,
  type FormDef,
  type WfTask,
} from "@eimsnext/models";
import {
  appDefService,
  formDataPermissionGroupService,
  identityService,
  formDataService,
  formDefService,
  formListViewService,
  systemService,
  wfTaskService,
  workflowService,
} from "@eimsnext/services";
import type { LoginRequest } from "@eimsnext/services";
import { ODataQueryRequest } from "@eimsnext/services";
import type { FormListView } from "@eimsnext/models";

const buildODataQuery = (filter?: string, skip = 0, top = 20, orderby?: string) => {
  const query = new ODataQueryRequest();
  query.$skip = skip;
  query.$top = top;

  if (filter) query.$filter = filter;
  if (orderby) query.$orderby = orderby;

  return query;
};

export const mobileIdentityService = {
  login(request: LoginRequest) {
    return identityService.login(request);
  },
  getCurrentUser() {
    return systemService.getCurrentUser();
  },
};

export const appServiceMobile = {
  getMyApps(): Promise<AppDef[]> {
    return appDefService.query<AppDef>();
  },
  get(appId: string): Promise<AppDef> {
    return appDefService.get<AppDef>(appId);
  },
};

export const formServiceMobile = {
  query(appId: string, skip = 0, top = 20): Promise<FormDef[]> {
    return formDefService.query<FormDef>(buildODataQuery(`appId eq '${appId}'`, skip, top, "createTime asc"));
  },
  get(formId: string): Promise<FormDef> {
    return formDefService.get<FormDef>(formId);
  },
};

export const formListViewServiceMobile = {
  query(formId: string): Promise<FormListView[]> {
    return formListViewService.query<FormListView>(`$filter=formid eq '${formId}'&$orderby=sortIndex asc,createTime asc`);
  },
};

export const formDataServiceMobile = {
  query(formId: string, skip = 0, top = 20, filter?: any, sort?: any, permissionGroupId?: string): Promise<FormData[]> {
    return formDataService.dynamicQuery<FormData>({
      skip,
      take: top,
      filter: filter || `formId eq '${formId}'`,
      sort: sort || "createTime desc",
      scope: permissionGroupId ? { permissionGroupId } : undefined,
    });
  },
  count(formId: string, filter?: any, permissionGroupId?: string): Promise<number> {
    return formDataService.dynamicCount({
      filter: filter || `formId eq '${formId}'`,
      scope: permissionGroupId ? { permissionGroupId } : undefined,
    });
  },
  get(dataId: string, permissionGroupId?: string): Promise<FormData> {
    return formDataService.get<FormData>(dataId, permissionGroupId ? { permissionGroupId } : undefined);
  },
  post(form: FormDef, data: Record<string, unknown>, action: DataAction): Promise<FormData> {
    return formDataService.post<FormData>({
      id: "",
      appId: form.appId,
      formId: form.id,
      data,
      action,
    } as never);
  },
  put(entity: FormData, data: Record<string, unknown>): Promise<FormData> {
    return formDataService.put<FormData>(entity.id, {
      id: entity.id,
      appId: entity.appId,
      formId: entity.formId,
      data,
      action: DataAction.Save,
    } as never);
  },
};

export const formDataPermissionGroupServiceMobile = {
  getAssigned(formId: string) {
    return formDataPermissionGroupService.getAssigned(formId);
  },
};

export const taskServiceMobile = {
  getCount(): Promise<number> {
    return wfTaskService.count();
  },
  query(appId?: string, skip = 0, top = 10): Promise<WfTask[]> {
    return wfTaskService.query<WfTask>(
      buildODataQuery(appId ? `appId eq '${appId}'` : undefined, skip, top, "approveNodeStartTime desc")
    );
  },
  get(taskId: string): Promise<WfTask> {
    return wfTaskService.get<WfTask>(taskId);
  },
  approve(dataId: string, action: ApproveAction, comment = "") {
    return workflowService.approve({ dataId, action, comment });
  },
  submit(dataId: string, wfInstanceId: string, wfNodeId: string, comment = "") {
    return workflowService.submit({ dataId, wfInstanceId, wfNodeId, action: ApproveAction.Approve, comment });
  },
  reject(dataId: string, wfInstanceId: string, wfNodeId: string, comment = "") {
    return workflowService.reject({ dataId, wfInstanceId, wfNodeId, action: ApproveAction.Reject, comment });
  },
  withdraw(dataId: string, wfInstanceId: string, comment = "") {
    return workflowService.withdraw({ dataId, wfInstanceId, comment });
  },
  urge(dataId: string, wfInstanceId: string) {
    return workflowService.urge({ dataId, wfInstanceId });
  },
  return(dataId: string, wfInstanceId: string, wfNodeId: string, targetNodeId: string, comment = "") {
    return workflowService["return"]({ dataId, wfInstanceId, wfNodeId, targetNodeId, comment });
  },
  addSign(dataId: string, wfInstanceId: string, wfNodeId: string, targetEmployeeId: string, comment = "") {
    return workflowService.addSign({ dataId, wfInstanceId, wfNodeId, targetEmployeeId, comment });
  },
  transfer(dataId: string, wfInstanceId: string, wfNodeId: string, targetEmployeeId: string, comment = "") {
    return workflowService.transfer({ dataId, wfInstanceId, wfNodeId, targetEmployeeId, comment });
  },
  getActionStatus(dataId: string, wfInstanceId?: string) {
    return workflowService.getActionStatus(dataId, wfInstanceId);
  },
  getReturnNodes(dataId: string, wfInstanceId?: string) {
    return workflowService.getReturnNodes(dataId, wfInstanceId);
  },
  getNodeActions(dataId: string, wfInstanceId: string) {
    return workflowService.getNodeActions(dataId, wfInstanceId);
  },
};

export const workflowServiceMobile = {
  getMyStarted(appId?: string, skip = 0, top = 10): Promise<WfTask[]> {
    return wfTaskService.dynamicQuery<WfTask>({
      skip,
      take: top,
      filter: appId ? `appId eq '${appId}'` : undefined,
      sort: "createTime desc",
      scope: "started",
    });
  },
  getApproved(appId?: string, skip = 0, top = 10): Promise<WfTask[]> {
    return wfTaskService.dynamicQuery<WfTask>({
      skip,
      take: top,
      filter: appId ? `appId eq '${appId}'` : undefined,
      sort: "updateTime desc",
      scope: "approved",
    });
  },
  getCced(appId?: string, skip = 0, top = 10): Promise<WfTask[]> {
    return wfTaskService.dynamicQuery<WfTask>({
      skip,
      take: top,
      filter: appId ? `appId eq '${appId}'` : undefined,
      sort: "createTime desc",
      scope: "cced",
    });
  },
};
