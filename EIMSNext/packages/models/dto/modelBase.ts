import { FieldDef, FieldType } from "./formDef";

export interface IIdentity {
  id: string;
}

export interface IDataModel {
  createBy?: Operator;
  createTime?: Date;
  updateBy?: Operator;
  updateTime?: Date;
}

export interface ICorpModel {
  corpId?: string;
}

export interface IdBase extends IIdentity {
  id: string;
}
export interface ModelBase extends IdBase, IDataModel {
  createBy?: Operator;
  createTime?: Date;
  updateBy?: Operator;
  updateTime?: Date;
}

export interface CorpModelBase extends ModelBase, ICorpModel {
  corpId?: string;
}

export class Operator {
  empId?: string;
  empName?: string;
}

export enum SystemField {
  Id = "id",
  CreateBy = "createBy",
  CreateTime = "createTime",
  UpdateBy = "updateBy",
  UpdateTime = "updateTime",
  FlowStatus = "flowStatus",
}

export function isSystemField(field: string) {
  return (
    field === SystemField.Id ||
    field === SystemField.CreateBy ||
    field === SystemField.CreateTime ||
    field === SystemField.UpdateBy ||
    field === SystemField.UpdateTime ||
    field === SystemField.FlowStatus
  );
}

export function getIdDef(title: string): FieldDef {
  let field = new FieldDef();
  field.field = SystemField.Id;
  field.title = title;
  field.type = FieldType.Input;
  return field;
}

// export function  getCreateBy(title: string): FieldDef {
//   let field = new FieldDef();
//   field.field = SystemField.CreateBy;
//   field.title = title;
//   field.type = FieldType.Input;
//   return field;
// }

export function getCreateTime(title: string): FieldDef {
  let field = new FieldDef();
  field.field = SystemField.CreateTime;
  field.title = title;
  field.type = FieldType.DatePicker;
  return field;
}

// export function getUpdateBy(title: string): FieldDef {
//   let field = new FieldDef();
//   field.field = SystemField.UpdateBy;
//   field.title = title;
//   field.type = FieldType.Input;
//   return field;
// }

export function getUpdateTime(title: string): FieldDef {
  let field = new FieldDef();
  field.field = SystemField.UpdateTime;
  field.title = title;
  field.type = FieldType.DatePicker;
  return field;
}

export function getFlowStatus(title: string): FieldDef {
  let field = new FieldDef();
  field.field = SystemField.FlowStatus;
  field.title = title;
  field.type = FieldType.Input;
  return field;
}
