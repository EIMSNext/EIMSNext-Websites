import { CorpModelBase, IdBase } from "./modelBase";
export enum FormType {
  Form = "0",
  Dashboard = "1",
  Group = "2",
}
export interface FormDefRequest extends IdBase {
  appId: string;
  name: string;
  type?: FormType;
  content: FormContent;
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
  items?: [];
}
export class FieldDef {
  field: string = "";
  title: string = "";
  type: FieldType = FieldType.None;
  columns?: FieldDef[];
  options?: FieldOpt;
}
export class FieldOpt {
  format?: string;
}
export enum FieldType {
  None = "none",
  Input = "input",
  InputNumber = "inputNumber",
  DatePicker = "datePicker",
  Phone = "phone",
  Email = "email",
  TextArea = "textarea",
  Radio = "radio",
  CheckBox = "checkbox",
  Select = "select",
  Employee = "employee",
  Department = "department",
  Address = "address",
  Location = "location",
  Pictures = "pictures",
  Files = "files",
  Signature = "signature",
  // TableForm = "tableForm",
  TableFormPro = "tableFormPro",
}
