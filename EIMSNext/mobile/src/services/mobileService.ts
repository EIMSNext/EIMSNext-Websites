import {
  DataAction,
  ApproveAction,
  FlowStatus,
  type AppDef,
  type BriefField,
  type FormData,
  type FormDef,
  type WfTask,
  type WfTaskLog,
} from "@eimsnext/models";
import {
  appDefService,
  SortDirection,
  type IDynamicFilter,
  formDataPermissionGroupService,
  identityService,
  formDataService,
  formDefService,
  formListViewService,
  systemService,
  wfTaskService,
  wfTaskLogService,
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

// OData 字符串字面量转义：appId 来自路由参数（用户可控），拼进 $filter 前必须转义
const escapeODataLiteral = (value: string) => value.replace(/'/g, "''");

// 与 PC 端保持一致：
// 待办走 OData /odata/v1/WfTask（后端按 EmployeeId 限制）；
// 我发起的 / 已办 / 抄送我走 OData /odata/v1/WfTaskLog + $filter，
// 不再使用 ReadonlyODataServiceBase.queryByScope（它走 /api/v1/...，且后端 WfTaskRequest 无 Scope 字段，无法区分）。
const WF_TASK_LOG_FILTER = {
  started: "nodeType eq 1",
  approved: "nodeType ne 1 and result ne 7",
  cced: "result eq 7",
} as const;

export type WorkflowTaskScope = keyof typeof WF_TASK_LOG_FILTER;

// 待办(WfTask) 与流转记录(WfTaskLog) 字段不同，统一成列表行模型给视图使用
export interface WorkflowTaskItem {
  id: string;
  appId: string;
  formId: string;
  dataId: string;
  formName: string;
  nodeName: string;
  time: number;
  starterLabel: string;
  dataBrief: BriefField[];
}

const toTaskItem = (task: WfTask): WorkflowTaskItem => ({
  id: task.id,
  appId: task.appId,
  formId: task.formId,
  dataId: task.dataId,
  formName: task.formName,
  nodeName: task.approveNodeName,
  time: task.approveNodeStartTime,
  starterLabel: task.starter?.label || "",
  dataBrief: task.dataBrief || [],
});

const toLogItem = (log: WfTaskLog): WorkflowTaskItem => ({
  id: log.id,
  appId: log.appId,
  formId: log.formId,
  dataId: log.dataId,
  formName: log.formName,
  nodeName: log.nodeName,
  time: log.approvalTime,
  starterLabel: log.approver?.label || "",
  dataBrief: log.dataBrief || [],
});

const queryTaskLogs = async (
  scope: WorkflowTaskScope,
  appId?: string,
  skip = 0,
  top = 10
): Promise<WorkflowTaskItem[]> => {
  const query = new ODataQueryRequest();
  query.$skip = skip;
  query.$top = top;
  query.$orderby = "approvalTime desc";
  query.$filter = appId
    ? `${WF_TASK_LOG_FILTER[scope]} and appId eq '${escapeODataLiteral(appId)}'`
    : WF_TASK_LOG_FILTER[scope];

  return (await wfTaskLogService.query<WfTaskLog>(query)).map(toLogItem);
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
    // 与 admin 的 appDefStore 保持一致：显式指定单页上限，避免应用较多时被服务端默认分页截断
    return appDefService.query<AppDef>("$top=100");
  },
  get(appId: string): Promise<AppDef> {
    return appDefService.get<AppDef>(appId);
  },
};

export const formServiceMobile = {
  query(appId: string, skip = 0, top = 20): Promise<FormDef[]> {
    return formDefService.query<FormDef>(
      buildODataQuery(`appId eq '${escapeODataLiteral(appId)}'`, skip, top, "createTime asc")
    );
  },
  get(formId: string): Promise<FormDef> {
    return formDefService.get<FormDef>(formId);
  },
};

export const formListViewServiceMobile = {
  // 与 admin 端保持一致：formid 为系统生成的标识，无需转义
  query(formId: string): Promise<FormListView[]> {
    return formListViewService.query<FormListView>(`$filter=formid eq '${formId}'&$orderby=sortIndex asc,createTime asc`);
  },
};

// 与 admin 端保持一致：默认排除草稿数据（admin/src/views/form/draftUtils.ts::createNonDraftFilter）
export const createNonDraftFilter = (formId: string): IDynamicFilter => ({
  rel: "and",
  items: [
    { field: "formId", type: "none", op: "eq", value: formId },
    { field: "flowStatus", type: "none", op: "ne", value: FlowStatus.Draft },
  ],
});

// 与 admin 端保持一致：未指定权限组时按「继承成员权限」收敛数据范围，
// 后端 Scope 为 null 时不追加任何权限过滤，会把超范围数据返回给客户端。
const formDataScope = (formId: string, permissionGroupId?: string) =>
  permissionGroupId ? { permissionGroupId } : { formId, inheritMemberPermissions: true };

const defaultSort = [{ field: "createTime", type: "timestamp", dir: SortDirection.Desc }];

export const formDataServiceMobile = {
  query(formId: string, skip = 0, top = 20, filter?: any, sort?: any, permissionGroupId?: string): Promise<FormData[]> {
    return formDataService.query<FormData>({
      skip,
      take: top,
      filter: filter || createNonDraftFilter(formId),
      sort: sort || defaultSort,
      scope: formDataScope(formId, permissionGroupId),
    });
  },
  count(formId: string, filter?: any, permissionGroupId?: string): Promise<number> {
    return formDataService.count({
      filter: filter || createNonDraftFilter(formId),
      scope: formDataScope(formId, permissionGroupId),
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
  put(entity: FormData, data: Record<string, unknown>, action: DataAction = DataAction.Save): Promise<FormData> {
    return formDataService.put<FormData>(entity.id, {
      id: entity.id,
      appId: entity.appId,
      formId: entity.formId,
      data,
      action,
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
      buildODataQuery(
        appId ? `appId eq '${escapeODataLiteral(appId)}'` : undefined,
        skip,
        top,
        "approveNodeStartTime desc"
      )
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
  getTasks(appId?: string, skip = 0, top = 10): Promise<WorkflowTaskItem[]> {
    return taskServiceMobile.query(appId, skip, top).then((tasks) => tasks.map(toTaskItem));
  },
  getMyStarted(appId?: string, skip = 0, top = 10): Promise<WorkflowTaskItem[]> {
    return queryTaskLogs("started", appId, skip, top);
  },
  getApproved(appId?: string, skip = 0, top = 10): Promise<WorkflowTaskItem[]> {
    return queryTaskLogs("approved", appId, skip, top);
  },
  getCced(appId?: string, skip = 0, top = 10): Promise<WorkflowTaskItem[]> {
    return queryTaskLogs("cced", appId, skip, top);
  },
};
