export interface ISelectedTag {
  id: string;
  label: string;
  type: TagType;
  error?: boolean;
  data?: any;
  code?: string;
  value?: string;
}
export enum TagType {
  None=0,
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
