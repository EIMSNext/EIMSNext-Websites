export interface ISelectedTag {
  id: string;
  label: string;
  type: TagType;
  error?: boolean;
  data?: any;
}
export enum TagType {
  None,
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
