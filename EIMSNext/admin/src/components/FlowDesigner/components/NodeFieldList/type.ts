import { getFieldIcon, toFormFieldDef } from "@/components/FieldList/type";
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
export function buildNodeFieldTree(
  forms: INodeForm[],
  fieldBuildRule?: FieldBuildRule
): ITreeNode[] {
  // console.log("buildNodeFieldTree", forms);

  const attachChildren = (pNode: ITreeNode, singleResult: boolean, ignoreTable: boolean) => {
    // console.log("forms, pnode", forms, pNode);
    const children = forms.find((x) => x.nodeId == pNode.id)?.form?.content?.items;
    if (children && children.length > 0) {
      children.forEach((x: FieldDef) => {
        if (x.type && x.type == FieldType.TableFormPro && x.columns && x.columns.length > 0) {
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

  return treeNodes;
}
