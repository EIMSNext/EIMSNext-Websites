import { CorpModelBase, IdBase, Operator } from "./modelBase";

export interface WfTodo extends CorpModelBase {
  wfInstanceId: string;
  approveNodeId: string;
  approveNodeName: string;
  employeeId: string;
  appId: string;
  formId: string;
  formName: string;
  dataId: string;
  formType: number;
  starter?: Operator;
  dataBrief: BriefField[];
  approveNodeStartTime: number;
}
export interface BriefField {
  field: string;
  title: string;
  value?: any;
}
