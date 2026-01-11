import { IFieldLimit } from "@/NodeFieldList/type";
import { IListItem } from "@/list/type";
import {
  FieldDef,
  FieldType,
  getFlowStatus,
  getCreateBy,
  getCreateTime,
  IFieldPerm,
} from "@eimsnext/models";

export interface IFormFieldDef {
  formId: string;
  field: string;
  label: string;
  type: FieldType;
  format?: string;
  options?: any;
  isSubField?: boolean;
  nodeId?: string;
  singleResultNode?: boolean;
}
export function splitSubField(subField: string) {
  return subField.split(">");
}
export function toFormFieldDef(
  formId: string,
  field: FieldDef,
  parent?: FieldDef,
  nodeId?: string,
  singleResultNode?: boolean
): IFormFieldDef {
  if (parent) {
    var fieldDef: IFormFieldDef = {
      formId,
      field: `${parent.field}>${field.field}`,
      label: `${parent.title}.${field.title}`,
      type: field.type,
      format: field.options?.format,
      options: field.options,
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
      format: field.options?.format,
      options: field.options,
      isSubField: false,
      nodeId: nodeId,
      singleResultNode: singleResultNode,
    };

    return fieldDef;
  }
}
export function getFieldIcon(type: FieldType) {
  return "el-icon-userFilled";
}
export function buildFieldListItems(
  formId: string,
  fields: FieldDef[],
  usingWf: boolean,
  nodeId?: string,
  fieldLimit?: IFieldLimit
): IListItem[] {
  const items: IListItem[] = [];

  if (!fieldLimit || fieldLimit.limitField == "master") {
    if (usingWf) {
      let status: IFormFieldDef = toFormFieldDef(
        formId,
        getFlowStatus("流程状态"),
        undefined,
        nodeId
      );
      items.push({
        id: status.field,
        label: status.label,
        data: status,
      });
    }
  }
  fields.forEach((x: FieldDef) => {
    if (x.type == FieldType.TableForm) {
      if (
        (!fieldLimit || fieldLimit.limitField == x.field) &&
        x.columns &&
        x.columns.length > 0
      ) {
        x.columns.forEach((sub: FieldDef) => {
          var fieldDef: IFormFieldDef = toFormFieldDef(formId, sub, x, nodeId);
          let item: IListItem = {
            id: fieldDef.field,
            label: fieldDef.label,
            data: fieldDef,
          };

          items.push(item);
        });
      }
    } else {
      if (!fieldLimit || fieldLimit.limitField == "master") {
        var fieldDef: IFormFieldDef = toFormFieldDef(
          formId,
          x,
          undefined,
          nodeId
        );
        let item: IListItem = {
          id: fieldDef.field,
          label: fieldDef.label,
          data: fieldDef,
        };

        items.push(item);
      }
    }
  });

  if (!fieldLimit || fieldLimit.limitField == "master") {
    if (formId != "employee") {
      let submitor: IFormFieldDef = toFormFieldDef(
        formId,
        getCreateBy("提交人"),
        undefined,
        nodeId
      );
      items.push({
        id: submitor.field,
        label: submitor.label,
        data: submitor,
      });

      let createTime: IFormFieldDef = toFormFieldDef(
        formId,
        getCreateTime("提交时间"),
        undefined,
        nodeId
      );
      items.push({
        id: createTime.field,
        label: createTime.label,
        data: createTime,
      });
    }
  }

  return items;
}
