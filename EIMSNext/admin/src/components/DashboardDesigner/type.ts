export interface IDataSource {
  id: string;
  type: DataSourceType;
  label: string;
}
export enum DataSourceType {
  Form,
}
export interface IDraggableItem {
  id: string;
  icon: string;
  label: string;
}
export interface IDataSourceField {
  formId?: string;
  id: string;
  label?: string;
  isComputed?: boolean;
}
