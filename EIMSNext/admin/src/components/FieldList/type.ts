import { FieldDef, FieldType, getFlowStatus, getCreateTime } from "@eimsnext/models";
import { IListItem } from "@eimsnext/components";

export interface IFormFieldDef {
  formId: string;
  field: string;
  label: string;
  type: FieldType;
  isSubField?: boolean;
  nodeId?: string;
  singleResultNode?: boolean;
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
  nodeId?: string
): IListItem[] {
  const items: IListItem[] = [];
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

  fields.forEach((x: FieldDef) => {
    if (x.type && x.type == FieldType.TableFormPro && x.columns && x.columns.length > 0) {
      x.columns.forEach((sub: FieldDef) => {
        var fieldDef: IFormFieldDef = toFormFieldDef(formId, sub, x, nodeId);
        let item: IListItem = {
          id: fieldDef.field,
          label: fieldDef.label,
          data: fieldDef,
        };

        items.push(item);
      });
    } else {
      var fieldDef: IFormFieldDef = toFormFieldDef(formId, x, undefined, nodeId);
      let item: IListItem = {
        id: fieldDef.field,
        label: fieldDef.label,
        data: fieldDef,
      };

      items.push(item);
    }
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

  return items;
}
