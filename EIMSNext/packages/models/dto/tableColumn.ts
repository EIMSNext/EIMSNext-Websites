export interface ITableColumn {
  field: string;
  title: string;
  type: string;
  format?: string;
  width?: number;
  children?: ITableColumn[];
  mergeField?: string;
  oriField: string;
}
