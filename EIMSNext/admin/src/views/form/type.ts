import { IFormFieldDef } from "@/components/FieldList/type";
import { FieldDef, FieldType, SystemField } from "@eimsnext/models";
import { Dictionary } from "@eimsnext/utils";

export interface ITableColumn {
  field: string;
  title: string;
  type: string;
  format?: string;
  width?: number;
  children?: ITableColumn[];
  mergeField?: string;
  oriField: string;
}
export function buildColumns(
  fields: FieldDef[],
  usingWf: boolean,
  displayFields: IFormFieldDef[]
): ITableColumn[] {
  const dispalyAll = displayFields.length == 0;
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
  if (usingWf && (dispalyAll || displayFields.find((d) => d.field == SystemField.FlowStatus))) {
    columns.push({
      field: SystemField.FlowStatus,
      title: "流程状态",
      type: FieldType.Input,
      mergeField: "_id",
      oriField: SystemField.FlowStatus,
    });
  }

  fields.forEach((x) => {
    if (
      dispalyAll ||
      displayFields.find((d) => d.field == x.field) ||
      subDisplayFields.has(x.field)
    ) {
      let col: ITableColumn = {
        field: x.field,
        title: x.title,
        type: x.type,
        format: x.options?.format,
        mergeField: "_id",
        oriField: `data.${x.field}`,
      };
      if (x.columns && x.columns.length > 0) {
        delete col["mergeField"];
        col.children = buildSubColumns(
          col.field,
          x.columns,
          dispalyAll,
          subDisplayFields.get(x.field)
        );
      } else {
        col.width = 120;
      }

      columns.push(col);
    }
  });

  if (usingWf && (dispalyAll || displayFields.find((d) => d.field == SystemField.CreateTime))) {
    columns.push({
      field: SystemField.CreateTime,
      title: "提交时间",
      type: FieldType.TimeStamp,
      format: "yyyy-MM-dd",
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
  subDisplayFields?: IFormFieldDef[]
): ITableColumn[] {
  const columns: ITableColumn[] = [];
  if (dispalyAll || subDisplayFields) {
    fields.forEach((x) => {
      if (dispalyAll || subDisplayFields?.find((d) => d.field == x.field)) {
        let col: ITableColumn = {
          field: x.field,
          title: x.title,
          type: x.type,
          format: x.options?.format,
          oriField: `${pField}>${x.field}`,
        };
        if (x.columns && x.columns.length > 0) {
          col.children = buildSubColumns(col.field, x.columns, dispalyAll);
        } else {
          col.width = 120;
        }

        columns.push(col);
      }
    });
  }

  return columns;
}
