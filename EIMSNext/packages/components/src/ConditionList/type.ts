import { IFormFieldDef } from "@/FieldList/type";
import { IFieldSortList } from "@/FieldSortList/type";
import { ISelectedTag } from "@/selectedTags/type";
import { FieldType, SystemField, isSystemField } from "@eimsnext/models";
import {
  IDynamicFindOptions,
  IDynamicFilter,
  SortDirection,
  IDataScope,
} from "@eimsnext/services";
// import { ODataQuery } from "@/utils/query";

export enum ConditionType {
  Form = 0,
  Node = 1,
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
  timestamp: ["eq", "ne", "gt", "gte", "lt", "lte", "empty", "notempty"],
  radio: ["eq", "ne", "in", "nin", "empty", "notempty"],
  checkbox: ["in", "nin", "empty", "notempty"],
  select: ["eq", "ne", "in", "nin", "empty", "notempty"],
  select2: ["in", "nin", "empty", "notempty"],
  departmentselect: ["eq", "ne", "in", "nin", "empty", "notempty"],
  departmentselect2: ["in", "nin", "empty", "notempty"],
  employeeselect: ["eq", "ne", "in", "nin", "empty", "notempty"],
  employeeselect2: ["in", "nin", "empty", "notempty"],
  other: ["empty", "notempty"],
};

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
  fields: IFormFieldDef[],
  filter: IConditionList,
  sort: IFieldSortList,
  skip: number,
  take: number,
  fixedFilter?: IDynamicFilter,
  scope?: IDataScope
) {
  let toDynamicFilter = (filter: IConditionList) => {
    let dfilter: IDynamicFilter = {};

    if (filter.items && filter.items.length > 0) {
      dfilter = { rel: filter.rel || "and", items: [] };
      filter.items.forEach((x) => {
        dfilter.items?.push(toDynamicFilter(x));
      });
    } else if (filter.field?.field) {
      dfilter.field = isSystemField(filter.field.field)
        ? filter.field.field
        : `data.${filter.field.field}`;
      dfilter.type = filter.field.type;
      dfilter.op = filter.op;
      if (
        filter.value?.value &&
        (dfilter.type == FieldType.EmployeeSelect ||
          dfilter.type == FieldType.EmployeeSelect2 ||
          dfilter.type == FieldType.DepartmentSelect ||
          dfilter.type == FieldType.DepartmentSelect2)
      ) {
        dfilter.value = filter.value.value.map((x: ISelectedTag) => x.id);
      } else {
        dfilter.value = filter.value?.value;
      }
    }

    return dfilter;
  };

  const findOpt = {} as IDynamicFindOptions;
  findOpt.skip = skip;
  findOpt.take = take;
  findOpt.scope = scope;

  if (fields.length > 0) {
    findOpt.select = [];
    fields.forEach((x) => {
      let field = isSystemField(x.field) ? x.field : `data.${x.field}`;
      findOpt.select?.push({ field: field, visible: true });
    });
  }

  if (sort.items.length > 0) {
    findOpt.sort = [];
    sort.items.forEach((x) => {
      let sField = isSystemField(x.field.field)
        ? x.field.field
        : `data.${x.field.field}`;
      findOpt.sort?.push({ field: sField, type: x.field.type, dir: x.sort });
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

export function toODataQuery<T>(
  filter: IConditionList,
  sort: IFieldSortList,
  skip: number,
  take: number,
  fixedFilter?: any
) {
  let getODataOp = (op: string) => {
    switch (op) {
      default:
        return op;
    }
  };

  // var query: ODataQuery<T> = { skip: skip, top: take };
  var query: any = { skip: skip, top: take };

  // if (fields.length > 0) {
  //   findOpt.select = [];
  //   fields.forEach((x) => {
  //     let field = isSystemField(x.field) ? x.field : `data.${x.field}`;
  //     findOpt.select?.push({ field: field, visible: true });
  //   });
  // }

  if (sort.items.length > 0) {
    query.orderBy = sort.items
      .map((x) =>
        x.sort == SortDirection.Desc ? `${x.field.field} desc` : x.field.field
      )
      .join(",");
  }

  var oFilter: any = undefined;

  if (filter.items && filter.items.length > 0) {
    let subFilters: any[] = [];
    filter.items.forEach((x) => {
      if (x.field?.field) {
        let op = getODataOp(x.op || ConditionOperator.Equals);
        let subFilter: any = {};
        subFilter[x.field.field] = {};
        subFilter[x.field.field][op] = x.value?.value;
        subFilters.push(subFilter);
      }
    });
    if (subFilters.length > 0) {
      oFilter = {};

      if (subFilters.length == 1) oFilter = subFilters[0];
      else if (subFilters.length > 1) {
        oFilter[filter.rel || "and"] = subFilters;
      }
    }
  } else if (filter.field?.field) {
    let op = getODataOp(filter.op || ConditionOperator.Equals);
    let subFilter: any = {};
    subFilter[filter.field.field] = {};
    subFilter[filter.field.field][op] = filter.value?.value;
    oFilter = subFilter;
  }

  if (fixedFilter) {
    if (oFilter) oFilter = { and: [oFilter, fixedFilter] };
    else oFilter = fixedFilter;
  }

  query.filter = oFilter;

  return query;
}
