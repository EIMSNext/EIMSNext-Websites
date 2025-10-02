import { Filter, OrderBy } from "odata-query";

export interface ODataQuery<T> {
  select?: string;
  filter?: Filter<T>;
  orderBy?: OrderBy<T>;
  pageNum: number;
  pageSize: number;
  [key: string]: any;
}
