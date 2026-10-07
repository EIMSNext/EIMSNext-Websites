import { CorpModelBase, IdBase, Operator } from "./modelBase";
export enum FormType {
  Form = "0",
  Dashboard = "1",
  Group = "2",
}
export interface FormDefRequest extends IdBase {
  appId?: string;
  name?: string;
  content?: FormContent;
  usingWorkflow?: boolean;
  formSettings?: FormSettings;
}

export interface FormDef extends CorpModelBase {
  name: string;
  appId: string;
  content?: FormContent;
  usingWorkflow: boolean;
  formSettings?: FormSettings;
  external?: boolean;
}

export interface FormSettings {
  dataTitle?: DataTitleSettings;
}

export interface DataTitleSettings {
  mode?: "default" | "custom";
  content?: string;
}

export class FormContent {
  layout?: string;
  options?: string;
  items?: FieldDef[];
  fieldChangeLogs?: FieldChangeLog[];
}
export interface FieldChangeLog {
  fieldId: string;
  fieldType: FieldType;
  fieldLabel: string;
  deletedBy?: Operator;
  deletedTime: number;
}

/**
 * 从表单定义的 Layout（原始规则 JSON）里提取「字段名 → 地址层级 level」。
 *
 * 后端 FormLayoutParser 只把白名单 props（required / memberSource / format / options…）
 * 映射进 FormContent.Items，地址的 level 会被丢掉；这里直接读 Layout 原文兜底，
 * 让筛选/查询条件也能按字段类型截断级联层级。（只读，不修改任何结构）
 */
export function buildFieldLevelMap(
  content?: Pick<FormContent, "layout">,
): Record<string, number> {
  const map: Record<string, number> = {};
  if (!content?.layout) {
    return map;
  }
  let parsed: any;
  try {
    parsed = JSON.parse(content.layout);
  } catch {
    return map;
  }

  const walk = (rules: any, parentField?: string) => {
    (Array.isArray(rules) ? rules : []).forEach((rule) => {
      if (!rule || typeof rule !== "object") return;
      const level = Number(rule.props?.level);
      const field = typeof rule.field === "string" ? rule.field : "";
      if (field && Number.isFinite(level) && level > 0) {
        map[field] = level;
        // 子表单列在字段定义里的键是「父字段>子字段」
        if (parentField) {
          map[`${parentField}>${field}`] = level;
        }
      }
      if (Array.isArray(rule.children)) {
        walk(rule.children, field || parentField);
      }
    });
  };

  // Layout 存在两种历史形态：规则数组，或 { root: { children: [...] } }
  if (Array.isArray(parsed)) {
    walk(parsed);
  } else if (parsed && typeof parsed === "object") {
    if (Array.isArray(parsed.children)) walk(parsed.children);
    if (parsed.root && Array.isArray(parsed.root.children)) {
      walk(parsed.root.children);
    }
  }
  return map;
}
export class FieldDef {
  field: string = "";
  title: string = "";
  type: FieldType = FieldType.None;
  i18n?: string;
  columns?: FieldDef[];
  props?: FieldProp;
  hidden?: boolean;
  source?: string;
  systemKind?: string;
}
export interface FieldProp {
  format?: string;
  options?: ValueOption[];
  segments?: SerialNoSegment[];
  memberSource?: MemberSource;
  // 地址字段的层级：1=省 2=省-市 3=省-市-区 4=省-市-区-详细地址
  level?: number;
}

export interface MemberSource {
  mode?: "all" | "custom";
  items?: MemberSourceItem[];
}

export interface MemberSourceItem {
  type: "department" | "employeeGroup" | "employee" | "dynamic";
  id: string;
  cascaded?: boolean;
}
export interface ValueOption {
  value: string;
  label: string;
}

/**
 * 流水号字段的组成段
 *  - type=fixed:   value (固定字符)
 *  - type=date:    format (日期格式)
 *  - type=field:   field  (取表单字段值)
 *  - type=counter: digits/padZero/reset/start (自动计数,后端生成)
 */
export type SerialNoSegmentType = "fixed" | "date" | "field" | "counter";
export type SerialNoResetCycle = "never" | "day" | "month" | "year";
export interface SerialNoSegment {
  id: string;
  type: SerialNoSegmentType;
  value?: string;
  format?: string;
  field?: string;
  digits?: number;
  padZero?: boolean;
  reset?: SerialNoResetCycle;
  start?: number;
}

export enum FieldType {
  None = "none",
  Input = "input",
  Number = "number",
  TimeStamp = "timestamp",
  // Phone = "phone",
  // Email = "email",
  TextArea = "textarea",
  Radio = "radio",
  CheckBox = "checkbox",
  Select1 = "select",
  Select2 = "select2",
  Address = "address",
  // Location = "location",
  ImageUpload = "imageupload",
  FileUpload = "fileupload",
  Signature = "signature",
  DataSelect = "dataselect",
  TableForm = "tableform",
  Employee1 = "employee1",
  Employee2 = "employee2",
  Department1 = "department1",
  Department2 = "department2",
  SerialNo = "serialno",
}

export const SortableFieldTypes = [
  FieldType.Input,
  FieldType.Number,
  FieldType.TimeStamp,
  FieldType.Radio,
  FieldType.Select1,
  FieldType.Employee1,
  FieldType.Department1,
];
