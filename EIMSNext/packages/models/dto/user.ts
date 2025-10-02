import { App } from "./app";
import { IdBase } from "./modelBase";
export interface User extends IdBase {}

export class CurrentUser {
  userId: string = "";
  userName: string = "";
  empId?: string;
  empCode?: string;
  empName?: string;
  corpId?: string;
  userType: UserType = UserType.None;
  apps?: App[];
  /** 头像URL */
  avatar?: string;
  /** 角色 */
  roles: string[] = [];
  /** 权限 */
  perms: string[] = [];
}

export enum UserType {
  /// <summary>
  /// 无身份用户
  /// </summary>
  None = 0,

  /// <summary>
  /// 系统
  /// </summary>
  System = 1,

  /// <summary>
  /// 客户端
  /// </summary>
  Client = 2,

  /// <summary>
  /// 企业创建者
  /// </summary>
  CorpOwmer = 4,

  /// <summary>
  /// 超级管理员
  /// </summary>
  CorpAdmin = 8,

  /// <summary>
  /// 普通管理员
  /// </summary>
  AppAdmin = 16,

  /// <summary>
  /// 应用管理员
  /// </summary>
  FormAdmin = 32,

  /// <summary>
  /// 普通员工
  /// </summary>
  Employee = 64,

  /// <summary>
  /// 匿名用户
  /// </summary>
  Anonymous = 32768,

  /// <summary>
  /// 用户已被禁用
  /// </summary>
  Disabled = 65536,
}
