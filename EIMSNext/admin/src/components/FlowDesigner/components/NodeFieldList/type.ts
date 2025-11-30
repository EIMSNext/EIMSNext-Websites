import {
  IFormFieldDef,
  getFieldIcon,
  splitSubField,
  toFormFieldDef,
} from "@/components/FieldList/type";
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
export interface IFieldBuildSetting {
  version: number;
  rule: FieldBuildRule;
  matchType: boolean;
  fieldLimit?: string;
  fieldMapping?: Record<string, IFormFieldMap>;
}
export interface IFormFieldMap {
  mainField: string;
  sorceField: string;
  mapMainField: string;
  mapField: string;
  mapNodeId?: string;
  mapCount: number;
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
  setting: IFieldBuildSetting,
  fieldDef?: IFormFieldDef
): ITreeNode[] {
  // console.log("buildNodeFieldTree", fieldDef);
  const fieldDataType = getConditionFieldType(fieldDef?.type);

  const attachChildren = (pNode: ITreeNode, singleResult: boolean, ignoreTable: boolean) => {
    const children = forms.find((x) => x.nodeId == pNode.id)?.form?.content?.items;
    if (children && children.length > 0) {
      //master fields
      children.forEach((x: FieldDef) => {
        if (x.type && x.type == FieldType.TableForm && x.columns && x.columns.length > 0) {
          if (!ignoreTable) {
            let shouldHidden = true;
            if (setting.fieldMapping) {
              var mappedField = fieldDef?.isSubField ? splitSubField(fieldDef.field)[0] : "master";
              let mapped = setting.fieldMapping[mappedField];
              // console.log("buid sub tree", fieldDef, mapped, pNode.id, mappedField, x.field);
              if (!mapped) {
                shouldHidden = false;
              } else {
                //当同级字段只有一个在MAP并且是当前字段时，不过滤。
                if (
                  mapped.mapCount == 1 &&
                  mapped.mapMainField == x.field &&
                  mapped.mapField != fieldDef?.field
                ) {
                  shouldHidden = false;
                }

                if (
                  shouldHidden &&
                  mapped.mapNodeId == pNode.id &&
                  mapped.mapMainField == x.field
                ) {
                  shouldHidden = false;
                }
              }
            }
            if (!shouldHidden) {
              x.columns.forEach((sub: FieldDef) => {
                //sub fields
                if (!setting.matchType || isFieldTypeMatched(fieldDataType, sub.type)) {
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
                }
              });
            }
          }
        } else {
          if (!setting.matchType || isFieldTypeMatched(fieldDataType, x.type)) {
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
      if (setting.rule == FieldBuildRule.All) {
        buildTreeNode(treeNodes, x);
      } else if (setting.rule == FieldBuildRule.SingleResultOnly) {
        if (x.singleResult) buildTreeNode(treeNodes, x);
      } else if (setting.rule == FieldBuildRule.OneLevelTable) {
        if (x.singleResult) buildTreeNode(treeNodes, x);
        else buildTreeNode(treeNodes, x, true);
      }
    });
  }

  return treeNodes;
}
