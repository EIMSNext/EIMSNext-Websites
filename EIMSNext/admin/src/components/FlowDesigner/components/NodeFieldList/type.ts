import { IFormFieldDef, getFieldIcon, toFormFieldDef } from "@/components/FieldList/type";
import { ITreeNode, TreeNodeType } from "@eimsnext/components";
import { FieldDef, FieldType, FormDef } from "@eimsnext/models";
export interface INodeForm {
  nodeId: string;
  nodeName: string;
  singleResult: boolean;
  form?: FormDef;
}
export enum FieldBuildRule {
  All = 0,
  SingleResultOnly = 1,
  OneLevelTable = 2,
}
export enum ConditionFieldType {
  None = "none",
  Input = "input",
  Number = "number",
  Select = "select",
  Select2 = "select2",
  TimeStamp = "timestamp",
  Other = "other",
}
export function getConditionFieldType(fieldtype?: string): ConditionFieldType {
  if (!fieldtype) return ConditionFieldType.None;

  let dataType = ConditionFieldType.Other;
  switch (fieldtype) {
    case FieldType.Input:
    case FieldType.TextArea:
      dataType = ConditionFieldType.Input;
      break;
    case FieldType.Number:
      dataType = ConditionFieldType.Number;
      break;
    case FieldType.TimeStamp:
      dataType = ConditionFieldType.TimeStamp;
      break;
    case FieldType.Radio:
    case FieldType.Select:
      dataType = ConditionFieldType.Select;
      break;
    case FieldType.CheckBox:
    case FieldType.Select2:
      dataType = ConditionFieldType.Select2;
      break;
  }

  return dataType;
}
export function isFieldTypeMatched(conFieldType: ConditionFieldType, fieldType: FieldType) {
  return conFieldType == getConditionFieldType(fieldType);
}
export function buildNodeFieldTree(
  forms: INodeForm[],
  matchType: boolean,
  fieldDef?: IFormFieldDef,
  fieldBuildRule?: FieldBuildRule
): ITreeNode[] {
  console.log("buildNodeFieldTree", fieldDef);
  const fieldDataType = getConditionFieldType(fieldDef?.type);

  const attachChildren = (pNode: ITreeNode, singleResult: boolean, ignoreTable: boolean) => {
    // console.log("forms, pnode", forms, pNode);
    const children = forms.find((x) => x.nodeId == pNode.id)?.form?.content?.items;
    if (children && children.length > 0) {
      children.forEach((x: FieldDef) => {
        if (!matchType || isFieldTypeMatched(fieldDataType, x.type)) {
          if (x.type && x.type == FieldType.TableForm && x.columns && x.columns.length > 0) {
            if (!ignoreTable) {
              x.columns.forEach((sub: FieldDef) => {
                let fieldDef = toFormFieldDef(pNode.data.form.id, sub, x, pNode.id, singleResult);
                const node: ITreeNode = {
                  id: `${pNode.id}-${fieldDef.field}`,
                  code: fieldDef.field,
                  label: fieldDef.label,
                  nodeType: TreeNodeType.Field,
                  children: [],
                  data: fieldDef,
                  icon: getFieldIcon(fieldDef.type),
                };
                attachChildren(node, singleResult, ignoreTable);
                if (!pNode.children) pNode.children = [];
                pNode.children.push(node);
              });
            }
          } else {
            let fieldDef = toFormFieldDef(pNode.data.form.id, x, undefined, pNode.id, singleResult);
            const node: ITreeNode = {
              id: `${pNode.id}-${fieldDef.field}`,
              code: fieldDef.field,
              label: fieldDef.label,
              nodeType: TreeNodeType.Field,
              children: [],
              data: fieldDef,
              icon: getFieldIcon(fieldDef.type),
            };
            attachChildren(node, singleResult, ignoreTable);
            if (!pNode.children) pNode.children = [];
            pNode.children.push(node);
          }
        }
      });
    }
  };
  const buildTreeNode = (
    treeNoes: ITreeNode[],
    nodeForm: INodeForm,
    ignoreTable: boolean = false
  ) => {
    const rootNode: ITreeNode = {
      id: nodeForm.nodeId,
      code: nodeForm.nodeId,
      label: `${nodeForm.nodeName}`,
      nodeType: TreeNodeType.Form,
      children: [],
      data: nodeForm,
    };

    attachChildren(rootNode, nodeForm.singleResult, ignoreTable);
    treeNoes.push(rootNode);
  };

  const treeNodes: ITreeNode[] = [];
  if (fieldDataType != ConditionFieldType.None) {
    forms.forEach((x) => {
      if (fieldBuildRule == FieldBuildRule.All) {
        buildTreeNode(treeNodes, x);
      } else if (fieldBuildRule == FieldBuildRule.SingleResultOnly) {
        if (x.singleResult) buildTreeNode(treeNodes, x);
      } else if (fieldBuildRule == FieldBuildRule.OneLevelTable) {
        if (x.singleResult) buildTreeNode(treeNodes, x);
        else buildTreeNode(treeNodes, x, true);
      }
    });
  }

  return treeNodes;
}
