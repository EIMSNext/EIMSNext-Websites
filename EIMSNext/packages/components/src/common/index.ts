import { IListItem } from "@/component";
export interface IDataItem {
  id: string;
  value?: string;
  label: string;
  type: DataItemType;
}
export enum DataItemType {
  Unknown = 0,
  Department,
  Employee,
  Role,
  Dynamic,
  AuthGroup,
  FlowNode,
  Print,
  App,
  Form,
  Group,
  Field,
}
export interface IDataItemView extends IDataItem {
  icon?: string;
  iconColor?: string;
  data?: any;
}
import {
  CurrentUser,
  Department,
  Employee,
  Role,
  RoleGroup,
} from "@eimsnext/models";

export interface ITreeNode extends IDataItemView {
  displayLabel?: string;
  children?: ITreeNode[];
  checked?: boolean;
  disabled?: boolean;
  readonly?: boolean;
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
    value: dept.code,
    label: `${dept.code} - ${dept.name}`,
    type: DataItemType.Department,
    children: [],
    data: dept,
    icon: "icon-organization",
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
      type: DataItemType.Group,
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
    type: DataItemType.Role,
    children: [],
    data: role,
    icon: "el-role",
  };
}

export function EmployeeToListItem(emp: Employee): IListItem {
  return {
    id: emp.id,
    value: emp.code,
    label: emp.empName,
    type: DataItemType.Employee,
    icon: "el-UserFilled",
    data: emp,
  };
}
