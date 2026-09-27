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
  advanced?: DataAdvancedSettings;
}

export interface DataAdvancedSettings {
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
  // Address = "address",
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
