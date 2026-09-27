import { IdBase, CorpModelBase } from "./modelBase";
import { FieldType } from "./formDef";

export enum FormListViewType {
  Table = "0",
  Kanban = "1",
  Gallery = "2",
}

export enum MobileFormListViewType {
  Table = "0",
  Card = "1",
}

export type CoverImagePosition = "top" | "left" | "right";
export type CoverImageFit = "cover" | "contain" | "circle" | "rectangle";
export type CardSize = "small" | "medium" | "large";
export type TableRowHeight = "auto" | "low" | "middle" | "high";

export interface FormListViewRequest extends IdBase {
  appId?: string;
  formId?: string;
  name?: string;
  pcType?: FormListViewType;
  mobileType?: MobileFormListViewType;
  sortIndex?: number;
  permissionGroupIds?: string[];
  settings?: string;
  defaultFilter?: string;
  defaultSort?: string;
  disabled?: boolean;
}

export interface FormListView extends CorpModelBase {
  appId: string;
  formId: string;
  name: string;
  pcType: FormListViewType;
  mobileType: MobileFormListViewType;
  sortIndex: number;
  permissionGroupIds?: string[];
  settings?: string;
  defaultFilter?: string;
  defaultSort?: string;
  disabled: boolean;
}

export interface FormListViewField {
  field: string;
  label: string;
  type: FieldType;
  isSubField?: boolean;
}

export interface FormListViewCardSettings {
  titleField?: string;
  showFieldTitle?: boolean;
  displayFields?: FormListViewField[];
  coverField?: string;
  imagePosition?: CoverImagePosition;
  imageFit?: CoverImageFit;
  cardSize?: CardSize;
}

export interface FormListViewTableSettings {
  displayFields?: FormListViewField[];
  rowHeight?: TableRowHeight;
}

export interface FormListViewKanbanSettings extends FormListViewCardSettings {
  groupField?: string;
  showEmptyGroup?: boolean;
}

export interface FormListViewGallerySettings extends FormListViewCardSettings {}

export interface FormListViewMobileSettings {
  displayFields?: FormListViewField[];
  titleField?: string;
  showImageContent?: boolean;
  showSubmitMeta?: boolean;
  fieldColumns?: 1 | 2 | 3;
}

export interface FormListViewSettings {
  table?: FormListViewTableSettings;
  kanban?: FormListViewKanbanSettings;
  gallery?: FormListViewGallerySettings;
  mobile?: FormListViewMobileSettings;
}
