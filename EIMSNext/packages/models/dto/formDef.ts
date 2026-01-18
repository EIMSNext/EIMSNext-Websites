import { CorpModelBase, IdBase } from "./modelBase";
export enum FormType {
  Form = "0",
  Dashboard = "1",
  Group = "2",
}
export interface FormDefRequest extends IdBase {
  appId?: string;
  name?: string;
  type?: FormType;
  content?: FormContent;
  isLedger?: boolean;
  usingWorkflow?: boolean;
}

export interface FormDef extends CorpModelBase {
  name: string;
  appId: string;
  type?: FormType;
  content?: FormContent;
  isLedger: boolean;
  usingWorkflow: boolean;
}

export class FormContent {
  layout?: string;
  options?: string;
  items?: FieldDef[];
}
export class FieldDef {
  field: string = "";
  title: string = "";
  type: FieldType = FieldType.None;
  columns?: FieldDef[];
  props?: FieldProp;
}
export interface FieldProp {
  format?: string;
  options?: ValueOption[];
}
export interface ValueOption {
  value: string;
  label: string;
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
  Select = "select",
  Select2 = "select2",
  // Address = "address",
  // Location = "location",
  ImageUpload = "imageupload",
  FileUpload = "fileupload",
  // Signature = "signature",
  TableForm = "tableform",
  EmployeeSelect = "employeeselect",
  EmployeeSelect2 = "employeeselect2",
  DepartmentSelect = "departmentselect",
  DepartmentSelect2 = "departmentselect2",
}
