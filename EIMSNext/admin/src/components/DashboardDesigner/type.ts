export interface IDataSource {
  id: string;
  type: DataSourceType;
  title: string;
}
export enum DataSourceType {
  Form,
}
export interface IDataSourceField {
  id: string;
  title: string;
  isComputed?: boolean;
}
