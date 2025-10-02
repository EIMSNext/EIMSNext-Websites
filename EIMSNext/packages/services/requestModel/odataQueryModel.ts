export class ODataQueryModel {
  $filter?: string;
  $expand?: string;
  $select?: string;
  $skip: number = 0;
  $take: number = 1000;
}
