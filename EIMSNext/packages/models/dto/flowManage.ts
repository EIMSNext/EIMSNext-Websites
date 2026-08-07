import { Operator } from "./modelBase";

export interface FlowManageTodoItem {
  todoId: string;
  wfInstanceId: string;
  dataId: string;
  formName: string;
  starter?: Operator;
  currentApproverName: string;
  departmentName: string;
  approveNodeId: string;
  approveNodeName: string;
  approveNodeStartTime: number;
}

export interface FlowManageTodoQueryResult {
  items: FlowManageTodoItem[];
  total: number;
}

export interface FlowManageQueryRequest {
  keyword?: string;
  pageNum: number;
  pageSize: number;
}

export interface ChangeApproverRequest {
  wfInstanceId: string;
  dataId: string;
  wfNodeId: string;
  targetEmployeeId: string;
  comment?: string;
}

export interface TerminateWorkflowRequest {
  wfInstanceId: string;
  dataId: string;
}
