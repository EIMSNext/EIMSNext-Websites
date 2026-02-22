import { DashItemType } from "@eimsnext/models";

export interface IDataSource {
  id: string;
  type: DatasourceType;
  label: string;
}
export enum DatasourceType {
  Form,
}

export interface IDraggableItem {
  id: string;
  icon: string;
  label: string;
  type: DashItemType;
}
export interface IDataSourceField {
  formId?: string;
  id: string;
  label?: string;
  isComputed?: boolean;
}
export interface IGridLayoutItem {
  /** 唯一标识 (必需) */
  i: string;
  /** 起始列 (必需) */
  x: number;
  /** 起始行 (必需) */
  y: number;
  /** 宽度（列数）(必需) */
  w: number;
  /** 高度（行数）(必需) */
  h: number;

  // 可选属性
  /** 最小宽度（覆盖全局） */
  minW?: number;
  /** 最大宽度（覆盖全局） */
  maxW?: number;
  /** 最小高度（覆盖全局） */
  minH?: number;
  /** 最大高度（覆盖全局） */
  maxH?: number;
  /** 是否可拖拽（覆盖全局） */
  isDraggable?: boolean;
  /** 是否可缩放（覆盖全局） */
  isResizable?: boolean;
  /** 拖拽时忽略的选择器，如 ".no-drag" */
  dragIgnoreFrom?: string;
  /** 缩放时忽略的选择器 */
  resizeIgnoreFrom?: string;

  /** 自定义业务字段（支持任意扩展） */
  inEdit?: boolean;
  drag?: boolean;
  type?: DashItemType; // 关联拖拽项类型
  [key: string]: any;
}

export interface IGridLayoutState {
  layout: IGridLayoutItem[];
  draggable: boolean;
  resizable: boolean;
}
