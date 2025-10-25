import { Filter, OrderBy } from "odata-query";

export interface ODataQuery<T> {
  select?: string;
  filter?: Filter<T>;
  orderBy?: OrderBy<T>;
  skip: number;
  top: number;
  [key: string]: any;
}
