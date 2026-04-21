import { IFormFieldDef, toFormFieldDef } from "@/FieldSelect/type";
import { INodeForm } from "@/NodeFieldList/type";
import { FieldDef, FieldType } from "@eimsnext/models";
import {
  FieldValueType,
  IFormulaRef,
  IFormulaValue,
  IFormFieldItem,
} from "@/FormFieldList/type";

export interface IDataflowFormulaTreeItem {
  id: string;
  label: string;
  formula?: boolean;
  info?: string;
  example?: string;
  field?: IFormFieldDef;
  children?: IDataflowFormulaTreeItem[];
}

export interface IFormulaInferenceError {
  field: string;
  label: string;
  message: string;
}

export interface IFormulaValidationResult {
  valid: boolean;
  errors: IFormulaInferenceError[];
}

export function getFormulaFieldDisplayLabel(
  field: IFormFieldDef,
  nodes: INodeForm[],
) {
  const nodeName = nodes.find((x) => x.nodeId == field.nodeId)?.nodeName;
  return nodeName ? `${nodeName}.${field.label}` : field.label;
}

function buildFieldDef(node: INodeForm, field: FieldDef, parent?: FieldDef) {
  return toFormFieldDef(node.form!.id, field, parent, node.nodeId, node.singleResult);
}

export function buildDataflowFieldTree(nodes: INodeForm[]): IDataflowFormulaTreeItem[] {
  return nodes.map((node) => {
    const children: IDataflowFormulaTreeItem[] = [];
    const fields = node.form?.content?.items ?? [];
    fields.forEach((field) => {
      if (field.type == FieldType.TableForm && field.columns?.length) {
        field.columns.forEach((sub) => {
          children.push({
            id: `${node.nodeId}:${field.field}>${sub.field}`,
            label: `${field.title}.${sub.title}`,
            field: buildFieldDef(node, sub, field),
            formula: true,
          });
        });
      } else {
        children.push({
          id: `${node.nodeId}:${field.field}`,
          label: field.title,
          field: buildFieldDef(node, field),
          formula: true,
        });
      }
    });

    return {
      id: node.nodeId,
      label: node.nodeName,
      children,
    };
  });
}

export function inferFormulaDrivingField(
  refs: IFormulaRef[],
  currentField: IFormFieldDef,
  siblingFields: IFormFieldItem[],
) {
  if (refs.length == 0) return undefined;
  if (refs.length == 1) return refs[0].field;

  const ownSubField = refs.find((x) => x.field.isSubField);
  if (ownSubField) return ownSubField.field;

  const ownMultiField = refs.find((x) => x.field.singleResultNode === false);
  if (ownMultiField) return ownMultiField.field;

  const siblingDrivenField = inferFromSiblingFields(currentField, siblingFields);
  if (siblingDrivenField) return siblingDrivenField;

  return refs[0].field;
}

function inferFromSiblingFields(
  currentField: IFormFieldDef,
  siblingFields: IFormFieldItem[],
) {
  const currentMainField = currentField.isSubField
    ? currentField.field.split(">")[0]
    : "master";

  const sibling = siblingFields.find((item) => {
    if (item.field.field == currentField.field) return false;
    if (item.value.type != "formula" || !item.value.formulaValue?.drivingField) {
      return false;
    }

    const siblingMainField = item.field.isSubField
      ? item.field.field.split(">")[0]
      : "master";
    return siblingMainField == currentMainField;
  });

  return sibling?.value.formulaValue?.drivingField;
}

export function normalizeFormulaValue(
  formulaValue: IFormulaValue | undefined,
  currentField: IFormFieldDef,
  siblingFields: IFormFieldItem[],
) {
  if (!formulaValue) return undefined;

  const usedRefs = formulaValue.refs.filter((x) =>
    formulaValue.expression.includes(x.key),
  );
  const drivingField = inferFormulaDrivingField(
    usedRefs,
    currentField,
    siblingFields,
  );

  return {
    expression: formulaValue.expression,
    refs: usedRefs,
    drivingField,
  } satisfies IFormulaValue;
}

export function validateFormulaFieldList(
  fields: IFormFieldItem[],
  errorMessage: string,
) {
  const errors: IFormulaInferenceError[] = [];

  fields.forEach((item) => {
    if (item.value.type != FieldValueType.Formula || !item.value.formulaValue)
      return;

    const formulaValue = normalizeFormulaValue(
      item.value.formulaValue,
      item.field,
      fields,
    );
    if (!formulaValue?.expression?.trim()) {
      errors.push({
        field: item.field.field,
        label: item.field.label,
        message: errorMessage,
      });
      return;
    }

    if (formulaValue.refs.length == 0) {
      if (item.field.isSubField) {
        errors.push({
          field: item.field.field,
          label: item.field.label,
          message: errorMessage,
        });
      }
      return;
    }

    if (!formulaValue.drivingField) {
      errors.push({
        field: item.field.field,
        label: item.field.label,
        message: errorMessage,
      });
      return;
    }

    if (item.field.isSubField && !formulaValue.drivingField.isSubField) {
      errors.push({
        field: item.field.field,
        label: item.field.label,
        message: errorMessage,
      });
    }
  });

  return {
    valid: errors.length == 0,
    errors,
  } satisfies IFormulaValidationResult;
}
