import {
  IFormFieldDef,
  getFieldIcon,
  splitSubField,
  toFormFieldDef,
} from "@/FieldSelect/type";
import { ITreeNode, TreeNodeType } from "@/common";
import { FieldDef, FieldType, FormDef } from "@eimsnext/models";

export interface INodeForm {
  nodeId: string;
  nodeName: string;
  singleResult: boolean;
  form?: FormDef;
}
export enum FieldBuildRule {
  All = 0,
  SingleResultOnly = 1,
  OneLevelTable = 2,
}
export interface IFieldBuildSetting {
  version: number;
  rule: FieldBuildRule;
  matchType: boolean;
  fieldLimit?: string;
  fieldMapping?: Record<string, IFormFieldMap>;
}
export interface IFormFieldMap {
  mainField: string;
  sourceField: string;
  mapMainField: string;
  mapField: string;
  mapNodeId?: string;
  mapSingleResult: boolean;
  mapCount: number;
}




 
 