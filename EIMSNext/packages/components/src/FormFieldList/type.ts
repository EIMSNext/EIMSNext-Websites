import { IFormFieldDef, toFormFieldDef } from "../FieldSelect/type";
import { FieldDef, FieldType, FormDef } from "@eimsnext/models";

export interface IFormFieldList {
  items: IFormFieldItem[];
}
export interface IFormFieldItem {
  field: IFormFieldDef;
  value: IFormFieldValue;
}

export interface IFormFieldValue {
  type: FieldValueType;
  value?: any;
  fieldValue?: IFormFieldDef;
  formulaValue?: IFormulaValue;
}

export interface IFormulaRef {
  key: string;
  field: IFormFieldDef;
}

export interface IFormulaValue {
  expression: string;
  refs: IFormulaRef[];
  drivingField?: IFormFieldDef;
}
export enum FieldValueType {
  Custom = "custom",
  Field = "field",
  Empty = "empty",
  Formula = "formula",
}

export interface FormFieldListInstance {
  addField: (fieldItem: IFormFieldItem) => void;
}

export function buildFormFieldList(
  formId: string,
  fields: FieldDef[],
  existingFields: IFormFieldItem[],
  mergeAll: boolean,
): IFormFieldItem[] {
  const items: IFormFieldItem[] = [];
  fields.forEach((x: FieldDef) => {
    if (x.type == FieldType.TableForm && x.columns && x.columns.length > 0) {
      x.columns.forEach((sub: FieldDef) => {
        let fieldDef = toFormFieldDef(formId, sub, x);
        let e = existingFields.find((f) => f.field.field == fieldDef.field);
        if (e) {
          items.push(e);
        } else {
          if (mergeAll) {
            items.push({
              field: fieldDef,
              value: { type: FieldValueType.Field },
            });
          }
        }
      });
    } else {
      let fieldDef = toFormFieldDef(formId, x);
      let e = existingFields.find((f) => f.field.field == fieldDef.field);
      if (e) {
        items.push(e);
      } else {
        if (mergeAll) {
          items.push({
            field: fieldDef,
            value: { type: FieldValueType.Field },
          });
        }
      }
    }
  });

  return items;
}

export function mergeFieldList(
  form: FormDef,
  existingFields: IFormFieldItem[],
  mergeAll: boolean,
) {
  if (form && form.content && form.content.items) {
    return buildFormFieldList(
      form.id,
      form.content.items,
      existingFields,
      mergeAll,
    );
  } else return existingFields;
}
