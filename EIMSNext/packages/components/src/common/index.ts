import { IListItem } from "@/component";
import {
  CurrentUser,
  Department,
  Employee,
  Role,
  RoleGroup,
} from "@eimsnext/models";

export interface ITreeNode {
  id: string;
  code?: string;
  label: string;
  displayLabel?: string;
  nodeType: TreeNodeType;
  icon?: string;
  children?: ITreeNode[];
  data?: any;
  checked?: boolean;
  disabled?: boolean;
  readonly?: boolean;
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
  id: string,
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
      const node: ITreeNode = DeptToTreeNode(x);
      attachChildren(node);
      if (!pNode.children) pNode.children = [];
      pNode.children.push(node);
    });
  };

  const treeNoes: ITreeNode[] = [];
  const rootDept = depts.find(
    (x) => x.parentId == undefined || x.parentId == "",
  );
  if (rootDept) {
    const rootNode: ITreeNode = DeptToTreeNode(rootDept);
    attachChildren(rootNode);
    treeNoes.push(rootNode);
  }

  return treeNoes;
}

export function DeptToTreeNode(dept: Department): ITreeNode {
  return {
    id: dept.id,
    code: dept.code,
    label: `${dept.code} - ${dept.name}`,
    nodeType: TreeNodeType.Dept,
    children: [],
    data: dept,
    icon: "el-UserFilled",
  };
}

export function buildRoleTree(groups: RoleGroup[], roles: Role[]): ITreeNode[] {
  const attachChildren = (pNode: ITreeNode) => {
    const children = roles.filter((x) => x.roleGroupId == pNode.id);
    children.forEach((x) => {
      const node: ITreeNode = RoleToTreeNode(x);
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
      icon: "el-Folder",
    };

    attachChildren(rootNode);
    treeNoes.push(rootNode);
  });

  return treeNoes;
}
export function RoleToTreeNode(role: Role): ITreeNode {
  return {
    id: role.id,
    label: role.name,
    nodeType: TreeNodeType.Role,
    children: [],
    data: role,
    icon: "el-UserFilled",
  };
}

export function EmployeeToListItem(emp: Employee): IListItem {
  return {
    id: emp.id,
    code: emp.code,
    label: emp.empName,
    icon: "el-UserFilled",
    data: emp,
  };
}
