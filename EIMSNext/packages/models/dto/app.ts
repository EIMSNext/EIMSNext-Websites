import { FormType } from "./formDef";
import { CorpModelBase, IdBase } from "./modelBase";

export interface AppRequest extends IdBase {
  name?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  sortIndex?: number;
}

export interface App extends CorpModelBase {
  name: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  sortIndex: number;
  appMenus: AppMenu[];
}

export interface AppMenu {
  /// <summary>
  /// 分组ID或表单ID
  /// </summary>
  menuId: string;

  /// <summary>
  /// 菜单名称
  /// </summary>
  title?: string;

  /// <summary>
  /// 图标
  /// </summary>
  icon?: string;

  /// <summary>
  /// 图标颜色
  /// </summary>
  iconColor?: string;

  /// <summary>
  /// 菜单类型
  /// </summary>
  menuType?: FormType;

  /// <summary>
  /// 排序值
  /// </summary>
  sortIndex?: number;

  /// <summary>
  /// 子菜单
  /// </summary>
  subMenus?: AppMenu[];
}
