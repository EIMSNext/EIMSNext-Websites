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

function findFirstFormMenu(menus: AppMenu[] = [], visibleMenuIds?: Set<string>): AppMenu | undefined {
  for (const menu of menus) {
    if (
      normalizeMenuType(menu.menuType) === FormType.Form &&
      (!visibleMenuIds || visibleMenuIds.has(menu.menuId))
    ) {
      return menu;
    }

    const matched = findFirstFormMenu(menu.subMenus || [], visibleMenuIds);
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

  const firstForm = findFirstFormMenu(app.appMenus, visibleSet);
  if (firstForm) {
    return `/app/${app.id}/form/${firstForm.menuId}`;
  }

  // An app without a valid dashboard entry must stay on its root page so
  // the empty-app screen can provide the create-form actions.
  return `/app/${app.id}`;
}
