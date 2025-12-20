export class ODataQueryModel {
  $filter?: string;
  $expand?: string;
  $select?: string;
  $skip: number = 0;
  $top: number = 20;
}

export interface IDynamicFindOptions {
  select?: IDynamicField[];
  filter?: IDynamicFilter;
  sort?: IDynamicSort[];
  skip: number;
  take: number;
}

export interface IDynamicField {
  field: string;
  visible: boolean;
}
export interface IDynamicFilter {
  rel?: string;
  field?: string;
  type?: string;
  op?: string;
  value?: any;
  items?: IDynamicFilter[];
}

export interface IDynamicSort {
  field: string;
  dir: SortDirection;
}
export enum SortDirection {
  Asc = 1,
  Desc = -1,
}
