declare module "vue-grid-layout-v3" {
  import type {
    DefineComponent,
    VNodeProps,
    AllowedComponentProps,
    ComponentCustomProps,
  } from "vue";

  /**
   * 事件处理函数类型
   */
  export type GridResizeEvent = (
    i: string | number,
    newH: number,
    newW: number,
    newHPx: number,
    newWPx: number
  ) => void;

  /** 移动完成事件 (moved) */
  export type GridMovedEvent = (i: string | number, x: number, y: number) => void;

  /** 容器尺寸变化事件 (container-resized) */
  export type GridContainerResizedEvent = (width: number, height: number) => void;

  /**
   * GridLayout 组件 Props
   */
  export interface GridLayoutProps {
    /** 布局数据，支持 v-model:layout (必需) */
    layout: IGridLayoutItem[];
    /** 栅格列数，默认 12 */
    colNum?: number;
    /** 每行高度（像素），默认 150 */
    rowHeight?: number;
    /** 网格间距 [水平, 垂直]，默认 [10, 10] */
    margin?: [number, number];
    /** 是否可拖拽，默认 true */
    isDraggable?: boolean;
    /** 是否可缩放，默认 true */
    isResizable?: boolean;
    /** 是否镜像（RTL），默认 false */
    isMirrored?: boolean;
    /** 是否垂直紧凑排列，默认 true */
    verticalCompact?: boolean;
    /** 防止组件重叠，默认 false */
    preventCollision?: boolean;
    /** 是否使用 CSS Transforms，默认 true */
    useCssTransforms?: boolean;
    /** 自动计算容器高度，默认 true */
    autoSize?: boolean;
    /** 背景颜色 */
    backgroundColor?: string;
  }

  /**
   *  GridItem 组件 Props
   */
  export interface GridItemProps {
    /** 唯一标识 (必需) */
    i: string | number;
    /** 起始列 (必需) */
    x: number;
    /** 起始行 (必需) */
    y: number;
    /** 宽度 (必需) */
    w: number;
    /** 高度 (必需) */
    h: number;

    // 可选覆盖属性
    minW?: number;
    maxW?: number;
    minH?: number;
    maxH?: number;
    isDraggable?: boolean;
    isResizable?: boolean;
    dragIgnoreFrom?: string;
    resizeIgnoreFrom?: string;
  }

  /**
   * 组件导出（严格的命名导出，无默认导出，避免混淆）
   * 完美支持: import { GridLayout, GridItem } from 'vue-grid-layout-v3'
   */
  export const GridLayout: DefineComponent<
    GridLayoutProps,
    {}, // Setup
    {}, // Data
    {}, // Computed
    {}, // Methods
    {}, // Mixins
    {}, // Extends
    {
      /** 布局更新双向绑定 */
      "update:layout": (newLayout: IGridLayoutItem[]) => void;
      /** 容器尺寸变化 */
      "container-resized": GridContainerResizedEvent;
    } & VNodeProps &
      AllowedComponentProps &
      ComponentCustomProps
  >;

  export const GridItem: DefineComponent<
    GridItemProps,
    {},
    {},
    {},
    {},
    {},
    {},
    {
      /** 缩放过程中持续触发 */
      resize: GridResizeEvent;
      /** 缩放完成触发 */
      resized: GridResizeEvent;
      /** 移动完成触发 */
      moved: GridMovedEvent;
    } & VNodeProps &
      AllowedComponentProps &
      ComponentCustomProps
  >;
}
