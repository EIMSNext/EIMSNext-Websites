import {
  FieldDef,
  getCreateBy,
  getCreateTime,
  getFlowStatus,
  SortableFieldTypes,
} from "@eimsnext/models";
import { IFormFieldDef, toFormFieldDef } from "../FieldSelect/type";
import { SortDirection } from "@eimsnext/services";
import { IFieldLimit } from "../NodeFieldList/type";
import { IListItem } from "../list/type";
import { DataItemType } from "../common";

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
  fieldLimit?: (IFieldLimit & { t?: (key: string) => string }),
): IListItem[] {
  const items: IListItem[] = [];
  const t = fieldLimit?.t;
  const getSystemFieldLabel = (key: "flowStatus" | "createBy" | "createTime") =>
    t ? t(`comp.fieldBlock.systemFields.${key}`) : ({
      flowStatus: "流程状态",
      createBy: "提交人",
      createTime: "提交时间",
    }[key]);

  if (
    !fieldLimit ||
    !fieldLimit.limitField ||
    fieldLimit.limitField == "master"
  ) {
    if (usingWf) {
      let status: IFormFieldDef = toFormFieldDef(
        formId,
        getFlowStatus(getSystemFieldLabel("flowStatus")),
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
        getCreateBy(getSystemFieldLabel("createBy")),
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
        getCreateTime(getSystemFieldLabel("createTime")),
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
