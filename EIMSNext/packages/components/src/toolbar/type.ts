import { ComputedRef } from "vue";

export interface ToolbarItem {
  type: "button" | "dropdown" | "devider";
  config: IToolbarItemConfig;
}
export interface IToolbarItemConfig {
  text: string;
  command: string;
  visible: boolean | ComputedRef<boolean>;
  type?: "primary" | "success" | "warning" | "danger" | "info";
  icon?: string;
  tooltip?: string;
  disabled?: boolean;
  class?: string;
  style?: string;
  menuItems?: IToolbarItemDropdownItem[];
  onCommand?: (...args: any[]) => void;
}
export interface IToolbarItemDropdownItem {
  text: string;
  command: string | number;
  visible: boolean;
  divided?: boolean;
  disabled?: boolean;
  class?: string;
  style?: string;
  checked?: boolean;
}
