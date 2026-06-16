import { AppDef, AppMenu, FormType } from "@eimsnext/models";

function normalizeMenuType(menuType: FormType | number | undefined): FormType {
  if (menuType === undefined) return FormType.Form;
  if (typeof menuType === "string") return menuType as FormType;
  return String(menuType) as FormType;
}

export function findAppMenu(menus: AppMenu[] = [], menuId?: string): AppMenu | undefined {
  if (!menuId) return undefined;

  for (const menu of menus) {
    if (menu.menuId === menuId) {
      return menu;
    }

    const matched = findAppMenu(menu.subMenus || [], menuId);
    if (matched) {
      return matched;
    }
  }

  return undefined;
}

export function resolveAppEntryPath(app: AppDef): string {
  const menu = findAppMenu(app.appMenus, app.homeEntryId);
  if (!menu) {
    return `/app/${app.id}/mytasks`;
  }

  const menuType = normalizeMenuType(menu.menuType);
  if (menuType === FormType.Dashboard) {
    return `/app/${app.id}/dash/${menu.menuId}`;
  }

  if (menuType === FormType.Form) {
    return `/app/${app.id}/form/${menu.menuId}`;
  }

  return `/app/${app.id}/mytasks`;
}
