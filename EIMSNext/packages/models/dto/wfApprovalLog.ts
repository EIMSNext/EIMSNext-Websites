import { CorpModelBase, IdBase, Operator } from "./modelBase";
import { BriefField } from "./wfTodo";
import { ApproveAction } from "./workflow";

export interface WfApprovalLog extends CorpModelBase {
  appId: string;
  formId: string;
  formName: string;
  dataId: string;
  wfVersion: number;
  nodeId: string;
  nodeName: string;
  nodeType: number;
  round: number;
  approver?: Operator;
  result: ApproveAction;
  comment?: string;
  signature?: string;
  approvalTime: Date;
  dataBrief: BriefField[];
}
