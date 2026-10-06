import { CorpModelBase, IdBase } from "./modelBase";

export interface CorporateSettingRequest extends IdBase {
  name?: string;
  value?: string;
  desc?: string;
}

export type CorporateSetting = CorpModelBase & {
  name: string;
  value: string;
  desc: string;
  deleteFlag?: boolean;
};
