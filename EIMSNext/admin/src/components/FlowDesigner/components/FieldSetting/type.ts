import { IFormFieldDef, toFormFieldDef } from "@/components/FieldList/type";
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
}
export enum FieldValueType {
  Custom = "custom",
  Field = "field",
  Empty = "empty",
}

export function buildFormFieldList(
  formId: string,
  fields: FieldDef[],
  existingFields: IFormFieldItem[],
  mergeAll: boolean
): IFormFieldItem[] {
  const items: IFormFieldItem[] = [];
  // console.log("buildFormFieldList", formId, fields, existingFields);
  fields.forEach((x: FieldDef) => {
    // console.log("x", x, x.type == FieldType.TableFormPro, x.type, FieldType.TableFormPro);
    if (x.type == FieldType.TableFormPro && x.columns && x.columns.length > 0) {
      x.columns.forEach((sub: FieldDef) => {
        let fieldDef = toFormFieldDef(formId, sub, x);
        let e = existingFields.find((f) => f.field.field == fieldDef.field);
        // console.log("e", e);
        if (e) {
          items.push(e);
        } else {
          if (mergeAll) {
            items.push({
              field: fieldDef,
              value: { type: FieldValueType.Custom },
            });
          }
        }
      });
    } else {
      let fieldDef = toFormFieldDef(formId, x);
      let e = existingFields.find((f) => f.field.field == fieldDef.field);
      // console.log("e", e);
      if (e) {
        items.push(e);
      } else {
        if (mergeAll) {
          items.push({
            field: fieldDef,
            value: { type: FieldValueType.Custom },
          });
        }
      }
    }
  });

  return items;
}

export function mergeFieldList(form: FormDef, existingFields: IFormFieldItem[], mergeAll: boolean) {
  if (form && form.content && form.content.items) {
    return buildFormFieldList(form.id, form.content.items, existingFields, mergeAll);
  } else return existingFields;
}

const FieldTypeMapping: Record<string, string[]> = {
  input: ["input", "textarea"],
  textarea: ["input", "textarea"],
  inputnumber: ["inputnumber"],
};

export { FieldTypeMapping };
