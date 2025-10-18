export interface ToolbarItem {
  type: "button" | "dropdown" | "devider";
  config: {
    text: string;
    command: string;
    type?: "primary" | "success" | "warning" | "danger" | "info";
    icon?: string;
    tooltip?: string;
    disabled?: boolean;
    class?: string;
    style?: string;
    menuItems?: {
      text: string;
      command: string | number;
      divided?: boolean;
      disabled?: boolean;
      class?: string;
      style?: string;
    }[];
    onCommand?: (...args: any[]) => void;
  };
}
