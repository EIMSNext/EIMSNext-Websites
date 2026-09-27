import type { ResourceCode } from "./clientGrant";
import { Operation } from "./clientGrant";

/** UI 上某个资源上可用的动作项。 */
export interface ResourceActionItem {
  /** 与 Operation 的 key 对应（小写）。 */
  key: "read" | "add" | "edit" | "delete" | "import";
  /** UI 标签。 */
  label: string;
  /** 位掩码数值。 */
  flag: number;
  /** 可选提示文字。 */
  hint?: string;
}

/** 资源的 UI 元数据。 */
export interface ResourceSpec {
  code: ResourceCode;
  /** 资源中文标签。 */
  label: string;
  /** 左侧分组（对应 i18n key `admin.apiKeyMgmt.apiScopeDialog.groups.*`）。 */
  group: "contacts" | "apps" | "workflow";
  /** 该资源在 UI 上渲染的动作集。 */
  actions: ResourceActionItem[];
  /** 仅 AppDef/FormDef 为 true：UI 隐藏其他 4 个开关。 */
  readOnly?: boolean;
}

export const Resources: ResourceSpec[] = [
  {
    code: "employee",
    label: "成员",
    group: "contacts",
    actions: standardActions(),
  },
  {
    code: "department",
    label: "部门",
    group: "contacts",
    actions: standardActions(),
  },
  {
    code: "employeeGroup",
    label: "员工组",
    group: "contacts",
    actions: standardActions(),
  },
  {
    code: "employeeGroupCategory",
    label: "员工组分类",
    group: "contacts",
    actions: standardActions(),
  },
  {
    code: "appdef",
    label: "应用",
    group: "apps",
    actions: [{ key: "read", label: "可读", flag: Operation.Read }],
    readOnly: true,
  },
  {
    code: "formdef",
    label: "表单",
    group: "apps",
    actions: [{ key: "read", label: "可读", flag: Operation.Read }],
    readOnly: true,
  },
  {
    code: "formdata",
    label: "数据",
    group: "apps",
    actions: standardActions(),
  },
  {
    code: "workflow.instance",
    label: "工作流实例",
    group: "workflow",
    actions: [
      { key: "read",  label: "可查询审批日志", flag: Operation.Read },
      { key: "edit",  label: "可终止流程实例", flag: Operation.Edit },
    ],
  },
  {
    code: "workflow.task",
    label: "工作流任务",
    group: "workflow",
    actions: [
      { key: "read",  label: "可查询我的待办", flag: Operation.Read },
      {
        key: "edit",
        label: "流程待办可流转",
        flag: Operation.Edit,
        hint: "涵盖：回退、加签、驳回、撤回、转交、提交",
      },
    ],
  },
];

function standardActions(): ResourceActionItem[] {
  return [
    { key: "read",   label: "可读",   flag: Operation.Read },
    { key: "add",    label: "可新增", flag: Operation.Add },
    { key: "edit",   label: "可修改", flag: Operation.Edit },
    { key: "delete", label: "可删除", flag: Operation.Delete },
    { key: "import", label: "可导入", flag: Operation.Import },
  ];
}

export function findResource(code: ResourceCode): ResourceSpec | undefined {
  return Resources.find((r) => r.code === code);
}

