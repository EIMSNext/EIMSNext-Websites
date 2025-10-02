import { IFormFieldDef } from "@/components/FieldList/type";
import { FieldType } from "@eimsnext/models";
export enum ConditionType {
  Form,
  Node,
}
export enum ConditionFieldType {
  Input = "input",
  Number = "number",
  Select = "select",
  Switch = "switch",
  DateTime = "datetime",
  Other = "other",
}
export enum ConditionOperator {
  Equals = "eq",
  NotEquals = "ne",
  GreaterThan = "gt",
  GreaterThanEquals = "gte",
  LessThan = "lt",
  LessThanEquals = "lte",
  In = "in",
  NotIn = "nin",
  Empty = "empty",
  NotEmpty = "notempty",
}
export enum ConditionValueType {
  Custom = "custom",
  Field = "field",
}
export const dataOperators: Record<string, string[]> = {
  input: ["eq", "ne", "in", "nin", "empty", "notempty"],
  number: ["eq", "ne", "gt", "gte", "lt", "lte", "empty", "notempty"],
  select: ["eq", "ne", "in", "nin", "empty", "notempty"],
  switch: ["eq", "ne"],
  datetime: ["eq", "ne", "gt", "gte", "lt", "lte", "empty", "notempty"],
  other: ["empty", "notempty"],
};

export function getConditionFieldType(fieldtype: string): ConditionFieldType {
  let dataType = ConditionFieldType.Input;
  switch (fieldtype) {
    case FieldType.InputNumber:
      dataType = ConditionFieldType.Number;
      break;
  }
  return dataType;
}

export interface IConditonValue {
  type: ConditionValueType;
  value?: any;
  fieldValue?: IFormFieldDef;
}

export interface IConditionList {
  id: string;

  rel?: string;
  items?: IConditionList[];
  isGroup?: boolean;
  groupLevel?: number;

  field?: IFormFieldDef;
  op?: string;
  value?: IConditonValue;
}
