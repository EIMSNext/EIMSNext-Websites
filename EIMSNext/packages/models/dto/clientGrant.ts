import { CorpModelBase, IdBase } from "./modelBase";

/** 资源代码（与后端 `EIMSNext.Service.Host.Authorization.Resources` 一一对应）。 */
export type ResourceCode =
  | "employee"
  | "department"
  | "employeeGroup"
  | "employeeGroupCategory"
  | "appdef"
  | "formdef"
  | "formdata"
  | "workflow.instance"
  | "workflow.task";

/**
 * 5 个标准动作（与后端 EIMSNext.Common.Operation 位掩码一一对应）。
 * 注意：本文件位定义必须与后端 Core/EIMSNext.Common/Enums.cs 同步。
 */
export const Operation = {
  Read: 1 << 0,
  Add: 1 << 1,
  Edit: 1 << 2,
  Delete: 1 << 3,
  Import: 1 << 4,
} as const;

/**
 * 单条资源授权（位掩码）。
 * 与后端 `EIMSNext.Service.Entities.ResourceActionGrant` 对应。
 */
export interface ResourceActionGrant {
  resource: ResourceCode;
  /** 位掩码数值；用 Operation | 运算组合。 */
  actions: number;
}

/**
 * 客户端授权（与 Client 一对一关联）。
 * 一个 corp 内每个 Client 通常只有一条 ClientGrant 记录。
 */
export interface ClientGrant extends CorpModelBase {
  clientId: string;
  name?: string;
  /** "all" | "partial" */
  appScope: "all" | "partial";
  appIds: string[];
  /** "all" | "partial" */
  apiScope: "all" | "partial";
  resourceActions: ResourceActionGrant[];
  ipWhitelist: string[];
  enabled: boolean;
}

export interface ClientGrantRequest extends IdBase {
  clientId: string;
  name?: string;
  appScope: "all" | "partial";
  appIds: string[];
  apiScope: "all" | "partial";
  resourceActions: ResourceActionGrant[];
  ipWhitelist: string[];
  enabled: boolean;
}
