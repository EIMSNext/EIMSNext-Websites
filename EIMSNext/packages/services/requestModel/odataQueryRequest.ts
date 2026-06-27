import { DataPerms, IFieldPerm } from "@eimsnext/models";

export class ODataQueryRequest {
  $filter?: string;
  $expand?: string;
  $select?: string;
  $orderby?: string;
  $skip: number = 0;
  $top: number = 20;
}

export interface IDynamicFindOptions {
  select?: IDynamicField[];
  filter?: IDynamicFilter;
  sort?: IDynamicSort[];
  skip: number;
  take: number;
  scope?: IDataScope;
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

export interface IFormDataFilterOptionsRequest {
  formId: string;
  field: string;
  fieldType?: string;
  keyword?: string;
  filter?: IDynamicFilter;
  limit?: number;
}

export interface IFormDataFilterOptionItem {
  id: string;
  label: string;
  value?: any;
}

export interface IFormDataFilterOptionsResponse {
  items?: IFormDataFilterOptionItem[];
}

export interface IDynamicSort {
  field: string;
  type?: string;
  dir: SortDirection;
}
export enum SortDirection {
  Unset = 0,
  Asc = 1,
  Desc = -1,
}
export interface IDataScope {
  authGroupId?: string;
  formId?: string;
  inheritMemberPermissions?: boolean;
}

export interface IFormDataPermissionScopeResponse {
  dataPerms: DataPerms;
  fieldPerms?: IFieldPerm[] | null;
}
