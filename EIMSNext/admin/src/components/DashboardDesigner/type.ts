export interface IDataSource {
  id: string;
  type: DataSourceType;
  label: string;
}
export enum DataSourceType {
  Form,
}
export interface IDataSourceField {
  formId?: string;
  id: string;
  label?: string;
  isComputed?: boolean;
}
