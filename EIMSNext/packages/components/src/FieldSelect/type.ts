import { IFieldLimit } from "../NodeFieldList/type";
import { DataItemType } from "../common";
import { IListItem } from "../list/type";
import {
  FieldDef,
  FieldType,
  getDataTitle,
  getFlowStatus,
  getCreateBy,
  getCreateTime,
  IFieldPerm,
  ValueOption,
} from "@eimsnext/models";

export interface IFormFieldDef {
  formId: string;
  field: string;
  label: string;
  type: FieldType;
  format?: string;
  options?: ValueOption[];
  isSubField?: boolean;
  nodeId?: string;
  singleResultNode?: boolean;
  sourceType?: "form" | "http" | "schedule";
  missing?: boolean;
}
export function splitSubField(subField: string) {
  return subField.split(">");
}
export function toFormFieldDef(
  formId: string,
  field: FieldDef,
  parent?: FieldDef,
  nodeId?: string,
  singleResultNode?: boolean,
): IFormFieldDef {
  if (parent) {
    var fieldDef: IFormFieldDef = {
      formId,
      field: `${parent.field}>${field.field}`,
      label: `${parent.title}.${field.title}`,
      type: field.type,
      format: field.props?.format,
      options: field.props?.options,
      isSubField: true,
      nodeId: nodeId,
      singleResultNode: singleResultNode,
    };
    return fieldDef;
  } else {
    var fieldDef: IFormFieldDef = {
      formId,
      field: field.field,
      label: field.title,
      type: field.type,
      format: field.props?.format,
      options: field.props?.options,
      isSubField: false,
      nodeId: nodeId,
      singleResultNode: singleResultNode,
    };

    return fieldDef;
  }
}
export function getFieldIcon(type: FieldType) {
  return "el-UserFilled";
}
export function buildFieldListItems(
  formId: string,
  fields: FieldDef[],
  usingWf: boolean,
  nodeId?: string,
  fieldLimit?: (IFieldLimit & { t?: (key: string) => string }),
): IListItem[] {
  const items: IListItem[] = [];
  const t = fieldLimit?.t;
  const getSystemFieldLabel = (key: "dataTitle" | "flowStatus" | "createBy" | "createTime") =>
    t ? t(`comp.fieldBlock.systemFields.${key}`) : ({
      dataTitle: "数据标题",
      flowStatus: "流程状态",
      createBy: "提交人",
      createTime: "提交时间",
    }[key]);

  if (
    !fieldLimit ||
    !fieldLimit.limitField ||
    fieldLimit.limitField == "master"
  ) {
    let dataTitle: IFormFieldDef = toFormFieldDef(
      formId,
      getDataTitle(getSystemFieldLabel("dataTitle")),
      undefined,
      nodeId,
    );
    items.push({
      id: dataTitle.field,
      label: dataTitle.label,
      data: dataTitle,
      type: DataItemType.Field,
    });

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
    if (fieldLimit?.excludeFieldTypes?.includes(x.type)) {
      return;
    }

    if (x.type == FieldType.TableForm) {
      if (
        (!fieldLimit ||
          !fieldLimit.limitField ||
          fieldLimit.limitField == x.field) &&
        x.columns &&
        x.columns.length > 0
      ) {
        x.columns.forEach((sub: FieldDef) => {
          if (fieldLimit?.excludeFieldTypes?.includes(sub.type)) {
            return;
          }

          var fieldDef: IFormFieldDef = toFormFieldDef(formId, sub, x, nodeId);
          let item: IListItem = {
            id: fieldDef.field,
            label: fieldDef.label,
            data: fieldDef,
            type: DataItemType.Field,
          };

          items.push(item);
        });
      }
    } else {
      if (
        !fieldLimit ||
        !fieldLimit.limitField ||
        fieldLimit.limitField == "master"
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
