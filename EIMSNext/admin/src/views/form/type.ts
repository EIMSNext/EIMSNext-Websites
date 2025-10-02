import { FieldDef, FieldType } from "@eimsnext/models";

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
export function buildColumns(fields: FieldDef[], usingWf: boolean): ITableColumn[] {
  const columns: ITableColumn[] = [];
  if (usingWf) {
    columns.push({
      field: "flowStatus",
      title: "流程状态",
      type: "input",
      mergeField: "_id",
      oriField: "flowStatus",
    });
  }

  fields.forEach((x) => {
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
      col.children = buildSubColumns(col.field, x.columns);
    } else {
      col.width = 120;
    }

    columns.push(col);
  });

  columns.push({
    field: "createTime",
    title: "提交时间",
    type: "datetime",
    format: "yyyy-MM-dd",
    mergeField: "_id",
    oriField: "createTime",
  });

  return columns;
}

function buildSubColumns(pField: string, fields: FieldDef[]): ITableColumn[] {
  const columns: ITableColumn[] = [];
  fields.forEach((x) => {
    let col: ITableColumn = {
      field: x.field,
      title: x.title,
      type: x.type,
      format: x.options?.format,
      oriField: `${pField}>${x.field}`,
    };
    if (x.columns && x.columns.length > 0) {
      col.children = buildSubColumns(col.field, x.columns);
    } else {
      col.width = 120;
    }

    columns.push(col);
  });

  return columns;
}
