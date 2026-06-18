import { AppDef, AppMenu, FormType } from "@eimsnext/models";

export function normalizeMenuType(menuType: FormType | number | undefined): FormType {
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

export function resolveAppEntryPath(app: AppDef, visibleMenuIds?: string[] | Set<string>): string {
  const visibleSet = Array.isArray(visibleMenuIds) ? new Set(visibleMenuIds) : visibleMenuIds;

  for (const entryId of app.homeEntryIds || []) {
    if (visibleSet && !visibleSet.has(entryId)) {
      continue;
    }

    const menu = findAppMenu(app.appMenus, entryId);
    if (!menu) {
      continue;
    }

    const menuType = normalizeMenuType(menu.menuType);
    if (menuType === FormType.Dashboard) {
      return `/app/${app.id}/dash/${menu.menuId}`;
    }
  }

  return `/app/${app.id}/mytasks`;
}
