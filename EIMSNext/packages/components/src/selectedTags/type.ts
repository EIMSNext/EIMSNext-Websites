export interface ISelectedTag {
  id: string;
  label: string;
  type: TagType;
  icon?: string;
  error?: boolean;
  data?: any;
  code?: string;
  value?: string;
  cascadedDept?: boolean;
}
export enum TagType {
  None = 0,
  Department,
  Employee,
  Role,
  Dynamic,
  AuthGroup,
  FlowNode,
  Print,
  App,
  Form,
}
