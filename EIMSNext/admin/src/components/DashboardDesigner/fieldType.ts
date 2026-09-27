import { FieldType } from "@eimsnext/models";

export enum DashboardConditionFieldType {
  None = "none",
  Input = "input",
  Number = "number",
  Radio = "radio",
  CheckBox = "checkbox",
  Select1 = "select",
  Select2 = "select2",
  TimeStamp = "timestamp",
  Employee1 = "employee1",
  Employee2 = "employee2",
  Department1 = "department1",
  Department2 = "department2",
  Asset = "asset",
  Other = "other",
}

export const getDashboardConditionFieldType = (fieldType?: FieldType | string): DashboardConditionFieldType => {
  if (!fieldType) return DashboardConditionFieldType.None;

  switch (fieldType) {
    case FieldType.Input:
    case FieldType.TextArea:
      return DashboardConditionFieldType.Input;
    case FieldType.Number:
      return DashboardConditionFieldType.Number;
    case FieldType.TimeStamp:
      return DashboardConditionFieldType.TimeStamp;
    case FieldType.Radio:
      return DashboardConditionFieldType.Radio;
    case FieldType.CheckBox:
      return DashboardConditionFieldType.CheckBox;
    case FieldType.Select1:
      return DashboardConditionFieldType.Select1;
    case FieldType.Select2:
      return DashboardConditionFieldType.Select2;
    case FieldType.Department1:
      return DashboardConditionFieldType.Department1;
    case FieldType.Department2:
      return DashboardConditionFieldType.Department2;
    case FieldType.Employee1:
      return DashboardConditionFieldType.Employee1;
    case FieldType.Employee2:
      return DashboardConditionFieldType.Employee2;
    case FieldType.ImageUpload:
    case FieldType.FileUpload:
      return DashboardConditionFieldType.Asset;
    default:
      return DashboardConditionFieldType.Other;
  }
};

export const isDashboardMultiValueType = (fieldType?: FieldType | string) => {
  const type = getDashboardConditionFieldType(fieldType);
  return [
    DashboardConditionFieldType.CheckBox,
    DashboardConditionFieldType.Select2,
    DashboardConditionFieldType.Employee2,
    DashboardConditionFieldType.Department2,
  ].includes(type);
};
