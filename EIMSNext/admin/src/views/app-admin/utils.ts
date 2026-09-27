import { AppMenu, FormType } from "@eimsnext/models";

export interface AppMenuItem {
  id: string;
  title: string;
  icon?: string;
  iconColor?: string;
  type: FormType;
}

import { normalizeMenuType as getMenuType } from "@/utils/appEntry";
export { getMenuType };

export function flattenAppMenus(menus: AppMenu[] = []): AppMenuItem[] {
  const result: AppMenuItem[] = [];
  const walk = (items: AppMenu[]) => {
    for (const item of items) {
      const type = getMenuType(item.menuType);
      if (type === FormType.Group) {
        walk(item.subMenus || []);
        continue;
      }

      result.push({
        id: item.menuId,
        title: item.title || "",
        icon: item.icon,
        iconColor: item.iconColor,
        type,
      });
    }
  };

  walk(menus);
  return result;
}

export function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}
