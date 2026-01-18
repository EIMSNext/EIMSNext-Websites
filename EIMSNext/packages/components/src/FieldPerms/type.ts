export interface IFieldPermItem {
  id: string;
  visible: boolean;
  editable: boolean;
  tableInsert?: boolean;
  tableEdit?: boolean;
  tableDelete?: boolean;
}
