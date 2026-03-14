import { FieldType } from "@eimsnext/models";
import { IDynamicFilter, SortDirection } from "./odataQueryRequest";

export interface AggCalcRequest {
  dataSource: IAgDatasource;
  dimensions?: IDimension[];
  metrics?: IMetric[];
  filter?: IDynamicFilter;
  sort?: IAgSortItem[];
  take?: number;
}

export interface IAgDatasource {
  id: string;
  type: DatasourceType;
}
export enum DatasourceType {
  Form,
}
export interface IDimension {
  id: string;
  type: FieldType;
}
export interface IMetric {
  id: string;
  type: FieldType;
  agFun?: AggregateFun;
}
export enum AggregateFun {
  Count = "count",
  Sum = "sum",
  Avg = "avg",
  Max = "max",
  Min = "min",
}
export interface IAgSortItem {
  id: string;
  type: FieldType;
  dir: SortDirection;
}
