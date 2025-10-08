import { IFormFieldDef } from "@/components/FieldList/type";
import { FieldType, SystemField, isSystemField } from "@eimsnext/models";
import { IFieldSortList } from "../FieldSortList/type";
import { IDynamicFindOptions, IDynamicFilter } from "@eimsnext/services";
export enum ConditionType {
  Form = 0,
  Node = 1,
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

export function toDynamicFindOptions(
  filter: IConditionList,
  sort: IFieldSortList,
  skip: number,
  take: number,
  fixedFilter?: IDynamicFilter
) {
  let toDynamicFilter = (filter: IConditionList) => {
    console.log("filter1", filter.items);
    let dfilter: IDynamicFilter = {};

    if (filter.items && filter.items.length > 0) {
      dfilter = { rel: filter.rel || "and", items: [] };
      filter.items.forEach((x) => {
        dfilter.items?.push(toDynamicFilter(x));
      });
    } else if (filter.field?.field) {
      console.log("filter2", filter);
      dfilter.field = isSystemField(filter.field.field)
        ? filter.field.field
        : `data.${filter.field.field}`;
      dfilter.type = filter.field.type;
      dfilter.op = filter.op;
      dfilter.value = filter.value?.value;
    }

    return dfilter;
  };

  const findOpt = {} as IDynamicFindOptions;
  findOpt.skip = skip;
  findOpt.take = take;

  if (sort.items.length > 0) {
    findOpt.sort = [];
    sort.items.forEach((x) => {
      findOpt.sort?.push({ field: x.field.field, dir: x.sort });
    });
  }

  let userFilter = toDynamicFilter(filter);
  if (fixedFilter) {
    findOpt.filter = { rel: "and", items: [fixedFilter, userFilter] };
  } else {
    findOpt.filter = userFilter;
  }

  return findOpt;
}

export function toODataQueryModel(
  filter: IConditionList,
  sort: IFieldSortList,
  skip: number,
  take: number
) {
  // var filter = new DynamicFilter();
  // if (Items?.Count > 0)
  // {
  //     filter.Rel = string.IsNullOrEmpty(Rel) ? FilterRel.And : Rel;
  //     filter.Items = new List<DynamicFilter>();
  //     Items.ForEach(x => filter.Items.Add(x.ToDynamicFilter()));
  // }
  // else if (Field != null)
  // {
  //     filter.Field = Constants.SystemFields.Contains(Field.Field, StringComparer.OrdinalIgnoreCase) ? Field.Field : "data." + Field.Field;
  //     filter.Type = Field.Type;
  //     filter.Op = Op;
  //     filter.Value = ParseValue(Value, out FieldValueType valueType);
  //     filter.ValueIsExp = valueType != FieldValueType.Custom;
  //     filter.ValueIsField = valueType == FieldValueType.Field;
  // }
}
