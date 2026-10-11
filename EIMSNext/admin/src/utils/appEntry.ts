import { AppDef, AppMenu, FormType } from "@eimsnext/models";

/** 菜单树最大层级，与后端 AppMenuHelper.MaxDepth 保持一致。 */
export const MAX_MENU_DEPTH = 3;

export type MenuCreateKind = "flow-form" | "form" | "dashboard" | "group";

export interface MenuCreatePayload {
  kind: MenuCreateKind;
  /** 新建到该分组下；为空时建在菜单根层。 */
  parentMenuId?: string;
}

export function normalizeMenuType(menuType: FormType | number | undefined): FormType {
  if (menuType === undefined) return FormType.Form;
  if (typeof menuType === "string") return menuType as FormType;
  return String(menuType) as FormType;
}

/**
 * 以完整菜单树为底，套用显示树（可能已按权限过滤）的层级与顺序，得到保存载荷。
 * 显示树中不存在的菜单保持原父级，并排在同层可见菜单之后。
 * 两者一致时为等价结果，因此不受限管理员保存行为不变。
 */
export function mergeMenuStructure(raw: AppMenu[] = [], display: AppMenu[] = []): AppMenu[] {
  const placement = new Map<string, { parentId: string | null; order: number }>();
  const rawParent = new Map<string, string | null>();
  const rawOrder = new Map<string, number>();
  const nodes = new Map<string, AppMenu>();

  const collectDisplay = (list: AppMenu[], parentId: string | null) => {
    list.forEach((menu, order) => {
      placement.set(menu.menuId, { parentId, order });
      collectDisplay(menu.subMenus || [], menu.menuId);
    });
  };
  collectDisplay(display, null);

  const collectRaw = (list: AppMenu[], parentId: string | null) => {
    list.forEach((menu, order) => {
      rawParent.set(menu.menuId, parentId);
      rawOrder.set(menu.menuId, order);
      nodes.set(menu.menuId, { ...menu, subMenus: undefined });
      collectRaw(menu.subMenus || [], menu.menuId);
    });
  };
  collectRaw(raw, null);

  const resolveParent = (menuId: string): string | null => {
    const placed = placement.get(menuId);
    if (placed && (placed.parentId === null || nodes.has(placed.parentId))) return placed.parentId;

    const fallback = rawParent.get(menuId);
    return fallback && nodes.has(fallback) ? fallback : null;
  };

  const children = new Map<string | null, AppMenu[]>();
  nodes.forEach((menu, menuId) => {
    const parentId = resolveParent(menuId);
    const siblings = children.get(parentId) ?? [];
    siblings.push(menu);
    children.set(parentId, siblings);
  });

  const rank = (menu: AppMenu): [number, number] => {
    const placed = placement.get(menu.menuId);
    return placed ? [0, placed.order] : [1, rawOrder.get(menu.menuId) ?? 0];
  };

  const build = (parentId: string | null): AppMenu[] =>
    (children.get(parentId) ?? [])
      .slice()
      .sort((a, b) => {
        const [groupA, rankA] = rank(a);
        const [groupB, rankB] = rank(b);
        return groupA - groupB || rankA - rankB;
      })
      .map((menu) => {
        const subMenus = build(menu.menuId);
        return { ...menu, subMenus: subMenus.length > 0 ? subMenus : undefined };
      });

  return build(null);
}

/**
 * 把 menuId 节点从原位置移到 parentId 分组下，返回新树。
 * 找不到节点 / 找不到父级 / 父子非法时返回 undefined，调用方据此跳过落库。
 */
export function moveMenuUnder(menus: AppMenu[], menuId: string, parentId: string): AppMenu[] | undefined {
  if (!menuId || !parentId || menuId === parentId) return undefined;

  const clone = (list: AppMenu[]): AppMenu[] =>
    list.map((menu) => ({ ...menu, subMenus: menu.subMenus ? clone(menu.subMenus) : undefined }));

  let moving: AppMenu | undefined;
  const detach = (list: AppMenu[]): AppMenu[] => {
    const kept: AppMenu[] = [];
    list.forEach((menu) => {
      if (menu.menuId === menuId) {
        moving = menu;
        return;
      }
      kept.push({ ...menu, subMenus: menu.subMenus ? detach(menu.subMenus) : undefined });
    });
    return kept;
  };

  const tree = detach(clone(menus));
  if (!moving) return undefined;

  const target = moving;
  const attach = (list: AppMenu[]): boolean => {
    for (const menu of list) {
      if (menu.menuId === parentId) {
        menu.subMenus = [...(menu.subMenus ?? []), { ...target, subMenus: undefined }];
        return true;
      }
      if (menu.subMenus && attach(menu.subMenus)) return true;
    }
    return false;
  };

  return attach(tree) ? tree : undefined;
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
