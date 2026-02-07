import { IDataItemView } from "@/common";

export interface ISelectedTag  extends IDataItemView{
  error?: boolean;
  cascadedDept?: boolean;
}

