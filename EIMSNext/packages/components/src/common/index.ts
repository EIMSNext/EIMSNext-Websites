import { Department, Role, RoleGroup } from "@eimsnext/models";

export interface ITreeNode {
  id: string;
  code?: string;
  label: string;
  nodeType: TreeNodeType;
  icon?: string;
  children?: ITreeNode[];
  data?: any;
}
export enum TreeNodeType {
  None = 0,
  Dept,
  Form,
  Field,
  Group,
  Role,
}

export function findNode(
  nodes: ITreeNode[],
  id: string
): ITreeNode | undefined {
  let node: ITreeNode | undefined = undefined;
  if (id) {
    nodes.forEach((x) => {
      if (x.id == id) {
        node = x;
        return;
      }

      if (x.children) {
        let child = findNode(x.children, id);
        if (child) {
          node = child;
          return;
        }
      }
    });
  }

  return node;
}

export function buildDeptTree(depts: Department[]): ITreeNode[] {
  const attachChildren = (pNode: ITreeNode) => {
    const children = depts.filter((x) => x.parentId == pNode.id);
    children.forEach((x) => {
      const node: ITreeNode = {
        id: x.id,
        code: x.code,
        label: `${x.code} - ${x.name}`,
        nodeType: TreeNodeType.Dept,
        children: [],
        data: x,
        icon: "el-icon-UserFilled",
      };
      attachChildren(node);
      if (!pNode.children) pNode.children = [];
      pNode.children.push(node);
    });
  };

  const treeNoes: ITreeNode[] = [];
  const rootDept = depts.find(
    (x) => x.parentId == undefined || x.parentId == ""
  );
  if (rootDept) {
    const rootNode: ITreeNode = {
      id: rootDept.id,
      code: rootDept.code,
      label: `${rootDept.code} - ${rootDept.name}`,
      nodeType: TreeNodeType.Dept,
      children: [],
      data: rootDept,
      icon: "el-icon-UserFilled",
    };

    attachChildren(rootNode);
    treeNoes.push(rootNode);
  }

  return treeNoes;
}

export function buildRoleTree(groups: RoleGroup[], roles: Role[]): ITreeNode[] {
  const attachChildren = (pNode: ITreeNode) => {
    const children = roles.filter((x) => x.roleGroupId == pNode.id);
    children.forEach((x) => {
      const node: ITreeNode = {
        id: x.id,
        label: x.name,
        nodeType: TreeNodeType.Role,
        children: [],
        data: x,
        icon: "el-icon-UserFilled",
      };
      attachChildren(node);
      if (!pNode.children) pNode.children = [];
      pNode.children.push(node);
    });
  };

  const treeNoes: ITreeNode[] = [];
  groups.forEach((x) => {
    const rootNode: ITreeNode = {
      id: x.id,
      label: x.name,
      nodeType: TreeNodeType.Group,
      children: [],
      data: x,
      icon: "el-icon-Folder",
    };

    attachChildren(rootNode);
    treeNoes.push(rootNode);
  });

  return treeNoes;
}
