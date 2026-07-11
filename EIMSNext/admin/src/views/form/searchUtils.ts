import { IFormFieldDef } from "@eimsnext/components";
import {
  FieldDef,
  FieldType,
  FormDef,
  getDataTitle,
  SystemField,
} from "@eimsnext/models";

export type FormDataSearchState = {
  keyword: string;
  selectedFields: string[];
};

const searchableFieldTypes = new Set<FieldType>([
  FieldType.Input,
  FieldType.TextArea,
  FieldType.Number,
  FieldType.Radio,
  FieldType.CheckBox,
  FieldType.Select1,
  FieldType.Select2,
  FieldType.SerialNo,
]);

export const isSearchableFieldType = (type?: FieldType | string) =>
  !!type && searchableFieldTypes.has(type as FieldType);

export const isSearchableField = (field?: Pick<IFormFieldDef, "field" | "type"> | null) => {
  if (!field) return false;
  if (field.field === SystemField.DataTitle) return true;
  return isSearchableFieldType(field.type);
};

export const filterSearchableFields = (fields: IFormFieldDef[]) =>
  fields.filter((field) => isSearchableField(field));

export const buildAllSearchableFields = (
  formDef: FormDef,
  t: (key: string) => string,
): IFormFieldDef[] => {
  const result: IFormFieldDef[] = [];
  const dataTitleField = getDataTitle(t("admin.formList.searchTitleField"));
  result.push({
    formId: formDef.id,
    field: dataTitleField.field,
    label: dataTitleField.title,
    type: dataTitleField.type,
    isSubField: false,
  });

  const appendField = (field: FieldDef, parent?: FieldDef) => {
    if (field.type === FieldType.TableForm) {
      field.columns?.forEach((sub) => appendField(sub, field));
      return;
    }

    if (!isSearchableFieldType(field.type)) return;

    result.push({
      formId: formDef.id,
      field: parent ? `${parent.field}>${field.field}` : field.field,
      label: parent ? `${parent.title}.${field.title}` : field.title,
      type: field.type,
      format: field.props?.format,
      options: field.props?.options,
      isSubField: !!parent,
    });
  };

  (formDef.content?.items || []).forEach((field) => appendField(field));
  return result;
};

export const normalizeSelectedSearchFields = (
  fields: string[],
  candidates: IFormFieldDef[],
) => {
  if (fields.length === 0) return [];
  const candidateSet = new Set(candidates.map((item) => item.field));
  return fields.filter((field) => candidateSet.has(field));
};

export const resolveSearchFields = (
  state: FormDataSearchState,
  candidates: IFormFieldDef[],
) => {
  if (!state.keyword.trim()) return [];
  const normalized = normalizeSelectedSearchFields(state.selectedFields, candidates);
  if (normalized.length > 0) return normalized;
  return candidates.map((field) => field.field);
};
