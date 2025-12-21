// 数据定义
export interface IListItem {
  id: string;
  code?:string;
  label: string;
  checked?: boolean;
  icon?: string;
  color?: string;
  data?: any;
}
