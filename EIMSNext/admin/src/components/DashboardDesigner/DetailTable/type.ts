import { IConditionList, IFieldSortList, IFormFieldDef, findFieldDef } from "@eimsnext/components";
import { FieldDef, FormDef, SystemField, ITableColumn } from "@eimsnext/models";
import { uniqueId } from "@eimsnext/utils";
import { IDataSource } from "../type";

export interface IDetailTableSetting {
  kind?: "detail-table";
  datasource: IDataSource;
  displayFields: IFormFieldDef[];
  filter: IConditionList;
  sort: IFieldSortList;
  pageSize: number;
  showIndex: boolean;
  showTop: boolean;
  take: number;
  fixedLeftColumns: number;
  fixedMobileColumns: number;
  inheritDataActionPerms: boolean;
}

export const createEmptyDetailFilter = (): IConditionList => ({
  id: uniqueId(),
  rel: "and",
  items: [],
});

export const createDefaultDetailTableSetting = (datasource: IDataSource): IDetailTableSetting => ({
  kind: "detail-table",
  datasource,
  displayFields: [],
  filter: createEmptyDetailFilter(),
  sort: { items: [] },
  pageSize: 20,
  showIndex: false,
  showTop: false,
  take: 20,
  fixedLeftColumns: 0,
  fixedMobileColumns: 0,
  inheritDataActionPerms: false,
});

export const parseDetailTableSetting = (details?: string): IDetailTableSetting | undefined => {
  if (!details) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(details) as Partial<IDetailTableSetting>;
    if (!parsed.datasource) {
      return undefined;
    }

    return {
      kind: "detail-table",
      datasource: parsed.datasource,
      displayFields: parsed.displayFields || [],
      filter: parsed.filter || createEmptyDetailFilter(),
      sort: parsed.sort || { items: [] },
      pageSize: parsed.pageSize || 20,
      showIndex: !!parsed.showIndex,
      showTop: !!parsed.showTop,
      take: parsed.take || 20,
      fixedLeftColumns: parsed.fixedLeftColumns || 0,
      fixedMobileColumns: parsed.fixedMobileColumns || 0,
      inheritDataActionPerms: !!parsed.inheritDataActionPerms,
    };
  } catch {
    return undefined;
  }
};

export const detailTableSettingValidate = (setting?: Partial<IDetailTableSetting>): boolean => {
  return !!setting?.datasource?.id;
};

export const buildDetailTableColumns = (
  formDef: FormDef,
  displayFields: IFormFieldDef[],
  t?: (key: string) => string,
): ITableColumn[] => {
  if (displayFields.length === 0) {
    return [];
  }

  return displayFields
    .map((field) => {
      const fieldDef = findFieldDef(formDef, field.field, t) as FieldDef | undefined;
      const format = "props" in (fieldDef || {}) ? fieldDef?.props?.format : field.format;
      return {
        field: field.field,
        title: field.label,
        type: field.type,
        format,
        width: field.field === SystemField.DataTitle ? 180 : 120,
        oriField: field.field,
      } as ITableColumn;
    });
};
