import { IFormFieldDef, getFieldIcon, splitSubField, toFormFieldDef } from "@/FieldList/type";
import { ITreeNode, TreeNodeType } from "@/common";
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
  sourceField: string;
  mapMainField: string;
  mapField: string;
  mapNodeId?: string;
  mapSingleResult: boolean;
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
  // console.log("buildNodeFieldTree", forms);
  const fieldDataType = getConditionFieldType(fieldDef?.type);

  const attachChildren = (pNode: ITreeNode, singleResult: boolean, ignoreTable: boolean) => {
    const children = forms.find((x) => x.nodeId == pNode.id)?.form?.content?.items;
    if (children && children.length > 0) {
      //master fields
      children.forEach((x: FieldDef) => {
        let shouldHidden = true;
        //1. 左边为子表字段
        if (fieldDef?.isSubField) {
          if (setting.fieldMapping) {
            let masterMap = setting.fieldMapping["master"];
            let mappedField = splitSubField(fieldDef.field)[0];
            let mapped = setting.fieldMapping[mappedField];

            let showLv2 = !!(masterMap && !masterMap.mapSingleResult && masterMap.mapNodeId);
            let singleOnly = !!(
              masterMap &&
              masterMap.mapSingleResult &&
              masterMap.mapMainField != "master"
            );

            if (x.type == FieldType.TableForm) {
              //1.1 右边为子表字段
              console.log(
                "map 1.1:" + fieldDef?.label,
                fieldDef?.field,
                masterMap,
                mapped,
                pNode.id,
                singleResult,
                x.field,
                showLv2,
                singleOnly
              );
              if (!singleOnly) {
                if (!ignoreTable || (showLv2 && pNode.id == masterMap.mapNodeId)) {
                  if (!mapped) {
                    shouldHidden = false;
                  } else {
                    //当同级字段只有一个在MAP并且是当前字段时，不过滤。
                    if (mapped.mapCount == 1 && mapped.sourceField == fieldDef?.field) {
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
                } else {
                  shouldHidden = ignoreTable;
                }
              }
            } else {
              //1.2 右边为主表
              console.log(
                "map 1.2:" + fieldDef?.label,
                fieldDef?.field,
                masterMap,
                mapped,
                pNode.id,
                singleResult,
                x.field,
                showLv2,
                singleOnly
              );
              if (!mapped) {
                shouldHidden = !singleResult || showLv2;
                console.log("1.2.1", shouldHidden);
              } else {
                if (singleOnly) {
                  if (!(showLv2 && pNode.id == masterMap.mapNodeId)) {
                    //当同级字段只有一个在MAP并且是当前字段时，不过滤。
                    if (mapped.mapCount == 1 && mapped.sourceField == fieldDef?.field) {
                      shouldHidden = false;
                    }

                    if (shouldHidden && mapped.mapNodeId == pNode.id) {
                      shouldHidden = false;
                    }
                  }
                }
              }
            }
          } else {
            shouldHidden = false;
          }
        } else {
          //2. 左边为主表
          if (setting.fieldMapping) {
            let mappedField = "master";
            let mapped = setting.fieldMapping[mappedField];

            let subMap: IFormFieldMap | undefined = undefined;
            for (const [key, map] of Object.entries(setting.fieldMapping)) {
              if (key != "master" && !map.mapSingleResult) {
                subMap = map;
                break;
              }
            }
            let singleOnly = subMap != undefined;

            if (x.type == FieldType.TableForm) {
              //2.1 右边为子表
              if (!singleOnly) {
                if (!ignoreTable) {
                  if (!mapped) {
                    shouldHidden = false;
                  } else {
                    //当同级字段只有一个在MAP并且是当前字段时，不过滤。
                    if (mapped.mapCount == 1 && mapped.sourceField == fieldDef?.field) {
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
                } else {
                  shouldHidden = ignoreTable;
                }
              }
            } else {
              //2.2 右边为主表
              if (!mapped || singleResult) {
                shouldHidden = false;
              } else {
                if (!singleOnly) {
                  //当同级字段只有一个在MAP并且是当前字段时，不过滤。
                  if (mapped.mapCount == 1 && mapped.sourceField == fieldDef?.field) {
                    shouldHidden = false;
                  }

                  if (shouldHidden && mapped.mapNodeId == pNode.id) {
                    shouldHidden = false;
                  }
                }
              }
            }
          }
        }

        // 生成节点
        if (!shouldHidden) {
          if (x.type == FieldType.TableForm) {
            if (x.columns) {
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
          } else {
            if (!setting.matchType || isFieldTypeMatched(fieldDataType, x.type)) {
              let fieldDef = toFormFieldDef(
                pNode.data.form.id,
                x,
                undefined,
                pNode.id,
                singleResult
              );
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

  //remove empty node
  for (let i = treeNodes.length - 1; i > -1; i--) {
    if (treeNodes[i].children?.length == 0) treeNodes.splice(i, 1);
  }

  return treeNodes;
}
