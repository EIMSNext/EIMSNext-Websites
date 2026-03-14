import {
  FieldDef,
  getCreateBy,
  getCreateTime,
  getFlowStatus,
  SortableFieldTypes,
} from "@eimsnext/models";
import { IFormFieldDef, toFormFieldDef } from "../FieldSelect/type";
import { SortDirection } from "@eimsnext/services";
import { IFieldLimit } from "@/NodeFieldList/type";
import { IListItem } from "@/list/type";
import { DataItemType } from "@/common";

export interface IFieldSortItem {
  field: IFormFieldDef;
  sort: SortDirection;
}

export interface IFieldSortList {
  items: IFieldSortItem[];
}

export function buildSortFieldListItems(
  formId: string,
  fields: FieldDef[],
  usingWf: boolean,
  nodeId?: string,
  fieldLimit?: IFieldLimit,
): IListItem[] {
  const items: IListItem[] = [];

  if (
    !fieldLimit ||
    !fieldLimit.limitField ||
    fieldLimit.limitField == "master"
  ) {
    if (usingWf) {
      let status: IFormFieldDef = toFormFieldDef(
        formId,
        getFlowStatus("流程状态"),
        undefined,
        nodeId,
      );
      items.push({
        id: status.field,
        label: status.label,
        data: status,
        type: DataItemType.Field,
      });
    }
  }
  fields.forEach((x: FieldDef) => {
    if (
      SortableFieldTypes.indexOf(x.type) > -1 &&
      (!fieldLimit ||
        !fieldLimit.limitField ||
        fieldLimit.limitField == "master")
    ) {
      var fieldDef: IFormFieldDef = toFormFieldDef(
        formId,
        x,
        undefined,
        nodeId,
      );
      let item: IListItem = {
        id: fieldDef.field,
        label: fieldDef.label,
        data: fieldDef,
        type: DataItemType.Field,
      };

      items.push(item);
    }
  });

  if (
    !fieldLimit ||
    !fieldLimit.limitField ||
    fieldLimit.limitField == "master"
  ) {
    if (formId != "employee") {
      let submitor: IFormFieldDef = toFormFieldDef(
        formId,
        getCreateBy("提交人"),
        undefined,
        nodeId,
      );
      items.push({
        id: submitor.field,
        label: submitor.label,
        data: submitor,
        type: DataItemType.Field,
      });

      let createTime: IFormFieldDef = toFormFieldDef(
        formId,
        getCreateTime("提交时间"),
        undefined,
        nodeId,
      );
      items.push({
        id: createTime.field,
        label: createTime.label,
        data: createTime,
        type: DataItemType.Field,
      });
    }
  }

  return items;
}
