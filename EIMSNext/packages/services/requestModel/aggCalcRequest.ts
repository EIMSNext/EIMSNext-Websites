import { FieldType } from "@eimsnext/models";
import { IDynamicFilter, SortDirection } from "./odataQueryRequest";

export interface AggCalcRequest {
  itemId: string;
  filter?: IDynamicFilter;
  sort?: IAgSortItem[];
  take?: number;
  skip?: number;
}

export interface AggPreviewRequest extends AggCalcRequest {
  details: string;
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
