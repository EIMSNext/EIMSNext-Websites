import type { ResourceCode } from "./clientGrant";
import { ResourceActionFlag } from "./clientGrant";

/** UI 上某个资源上可用的动作项。 */
export interface ResourceActionItem {
  /** 与 ResourceActionFlag 的 key 对应（小写）。 */
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
  /** 左侧分组。 */
  group: "通讯录" | "应用" | "工作流";
  /** 该资源在 UI 上渲染的动作集。 */
  actions: ResourceActionItem[];
  /** 仅 AppDef/FormDef 为 true：UI 隐藏其他 4 个开关。 */
  readOnly?: boolean;
}

export const Resources: ResourceSpec[] = [
  {
    code: "employee",
    label: "成员",
    group: "通讯录",
    actions: standardActions(),
  },
  {
    code: "department",
    label: "部门",
    group: "通讯录",
    actions: standardActions(),
  },
  {
    code: "role",
    label: "角色",
    group: "通讯录",
    actions: standardActions(),
  },
  {
    code: "roleGroup",
    label: "角色组",
    group: "通讯录",
    actions: standardActions(),
  },
  {
    code: "appdef",
    label: "应用",
    group: "应用",
    actions: [{ key: "read", label: "可读", flag: ResourceActionFlag.Read }],
    readOnly: true,
  },
  {
    code: "formdef",
    label: "表单",
    group: "应用",
    actions: [{ key: "read", label: "可读", flag: ResourceActionFlag.Read }],
    readOnly: true,
  },
  {
    code: "formdata",
    label: "数据",
    group: "应用",
    actions: standardActions(),
  },
  {
    code: "workflow.instance",
    label: "工作流实例",
    group: "工作流",
    actions: [
      { key: "read",  label: "可查询审批日志", flag: ResourceActionFlag.Read },
      { key: "edit",  label: "可终止流程实例", flag: ResourceActionFlag.Edit },
    ],
  },
  {
    code: "workflow.task",
    label: "工作流任务",
    group: "工作流",
    actions: [
      { key: "read",  label: "可查询我的待办", flag: ResourceActionFlag.Read },
      {
        key: "edit",
        label: "流程待办可流转",
        flag: ResourceActionFlag.Edit,
        hint: "涵盖：回退、加签、驳回、撤回、转交、提交",
      },
    ],
  },
];

function standardActions(): ResourceActionItem[] {
  return [
    { key: "read",   label: "可读",   flag: ResourceActionFlag.Read },
    { key: "add",    label: "可新增", flag: ResourceActionFlag.Add },
    { key: "edit",   label: "可修改", flag: ResourceActionFlag.Edit },
    { key: "delete", label: "可删除", flag: ResourceActionFlag.Delete },
    { key: "import", label: "可导入", flag: ResourceActionFlag.Import },
  ];
}

export function findResource(code: ResourceCode): ResourceSpec | undefined {
  return Resources.find((r) => r.code === code);
}
