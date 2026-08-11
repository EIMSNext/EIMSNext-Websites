import { IFormFieldDef } from "@eimsnext/components";
import {
  FieldDef,
  FieldType,
  IFieldPerm,
  SystemField,
  getDataTitle,
  getCreateBy,
  getCreateTime,
  getFlowStatus,
} from "@eimsnext/models";
import { Dictionary } from "@eimsnext/utils";

import { ITableColumn } from "@eimsnext/models";

export type { ITableColumn };
export function buildColumns(
  fields: FieldDef[],
  usingWf: boolean,
  displayFields: IFormFieldDef[],
  fieldPerms?: IFieldPerm[],
  t?: (key: string) => string,
): ITableColumn[] {
  const canViewField = (field: string) =>
    fieldPerms === undefined ||
    fieldPerms.some((permission) => permission.id === field && permission.visible);
  const getSystemFieldLabel = (key: "dataTitle" | "flowStatus" | "createBy" | "createTime") =>
    t ? t(`comp.fieldBlock.systemFields.${key}`) : ({
      dataTitle: "数据标题",
      flowStatus: "流程状态",
      createBy: "提交人",
      createTime: "提交时间",
    }[key]);
  const dispalyAll = displayFields.length == 0 && fieldPerms === undefined;
  const subDisplayFields = new Dictionary();
  displayFields.forEach((d) => {
    if (d.isSubField) {
      let subFields = d.field.split(">");
      let subField: IFormFieldDef = {
        field: subFields[1],
        formId: d.formId,
        label: d.label,
        type: d.type,
      };

      let mainField = subDisplayFields.get(subFields[0]);
      if (mainField) {
        mainField.push(subField);
      } else {
        subDisplayFields.add(subFields[0], [subField]);
      }
    }
  });

  const columns: ITableColumn[] = [];
  if (canViewField(SystemField.DataTitle) && (dispalyAll || displayFields.find((d) => d.field == SystemField.DataTitle))) {
    const dataTitleField = getDataTitle(getSystemFieldLabel("dataTitle"));
    columns.push({
      field: dataTitleField.field,
      title: dataTitleField.title,
      type: dataTitleField.type,
      width: 180,
      mergeField: "_id",
      oriField: SystemField.DataTitle,
    });
  }

  if (usingWf && canViewField(SystemField.FlowStatus) && (dispalyAll || displayFields.find((d) => d.field == SystemField.FlowStatus))) {
    const statusField = getFlowStatus(getSystemFieldLabel("flowStatus"));
    columns.push({
      field: statusField.field,
      title: statusField.title,
      type: statusField.type,
      width: 80,
      mergeField: "_id",
      oriField: SystemField.FlowStatus,
    });
  }

  fields.forEach((x) => {
    if (x.type === FieldType.DataSelect) {
      return;
    }

    if (
      canViewField(x.field) &&
      (dispalyAll ||
        displayFields.find((d) => d.field == x.field) ||
        subDisplayFields.has(x.field))
    ) {
      let col: ITableColumn = {
        field: x.field,
        title: x.title,
        type: x.type,
        format: x.props?.format,
        mergeField: "_id",
        oriField: `data.${x.field}`,
      };
      if (x.columns && x.columns.length > 0) {
        delete col["mergeField"];
        col.children = buildSubColumns(
          col.field,
          x.columns,
          dispalyAll,
          subDisplayFields.get(x.field),
          fieldPerms,
        );
      } else {
        col.width = 120;
      }

      columns.push(col);
    }
  });

  if (canViewField(SystemField.CreateBy) && (dispalyAll || displayFields.find((d) => d.field == SystemField.CreateBy))) {
    const createByField = getCreateBy(getSystemFieldLabel("createBy"));
    columns.push({
      field: createByField.field,
      title: createByField.title,
      type: createByField.type,
      mergeField: "_id",
      oriField: SystemField.CreateBy,
    });
  }

  if (canViewField(SystemField.CreateTime) && (dispalyAll || displayFields.find((d) => d.field == SystemField.CreateTime))) {
    const createTimeField = getCreateTime(getSystemFieldLabel("createTime"));
    columns.push({
      field: createTimeField.field,
      title: createTimeField.title,
      type: createTimeField.type,
      format: createTimeField.props?.format,
      mergeField: "_id",
      oriField: SystemField.CreateTime,
    });
  }

  return columns;
}

function buildSubColumns(
  pField: string,
  fields: FieldDef[],
  dispalyAll: boolean,
  subDisplayFields?: IFormFieldDef[],
  fieldPerms?: IFieldPerm[],
): ITableColumn[] {
  const columns: ITableColumn[] = [];
  if (dispalyAll || subDisplayFields) {
    fields.forEach((x) => {
      if (x.type === FieldType.DataSelect) {
        return;
      }

      const fieldId = `${pField}>${x.field}`;
      const canView = fieldPerms === undefined ||
        fieldPerms.some((permission) => permission.id === fieldId && permission.visible);
      if (canView && (dispalyAll || subDisplayFields?.find((d) => d.field == x.field))) {
        let col: ITableColumn = {
          field: x.field,
          title: x.title,
          type: x.type,
          format: x.props?.format,
          oriField: `${pField}>${x.field}`,
        };
        if (x.columns && x.columns.length > 0) {
          col.children = buildSubColumns(fieldId, x.columns, dispalyAll, undefined, fieldPerms);
        } else {
          col.width = 120;
        }

        columns.push(col);
      }
    });
  }

  return columns;
}
