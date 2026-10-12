import { AppDef, FormDef, FormType } from "@eimsnext/models";

export interface IFormItem {
  id: string;
  label?: string;
  icon?: string;
  iconColor?: string;
  appId?: string;
  appName?: string;
  external?: boolean;
}

export interface IFormSelectOptions {
  exclude?: string[];
}

export function buildFormListItems(
  app: AppDef,
  options?: IFormSelectOptions,
): IFormItem[] {
  const items: IFormItem[] = [];
  const exclude = options?.exclude || [];
  const collect = (menus: AppDef["appMenus"]) => {
    menus.forEach((x) => {
      const menuType = String(x.menuType);
      if (menuType === FormType.Group) {
        collect(x.subMenus || []);
        return;
      }

      if (menuType === FormType.Form && !exclude.includes(x.menuId)) {
        items.push({
          id: x.menuId,
          label: x.title!,
          icon: x.icon,
          iconColor: x.iconColor,
        });
      }
    });
  };

  collect(app.appMenus || []);

  return items;
}

export function buildFormDefListItems(forms: FormDef[], options?: IFormSelectOptions): IFormItem[] {
  const exclude = options?.exclude || [];
  return forms
    .filter((item) => exclude.indexOf(item.id) === -1)
    .map((item) => ({
      id: item.id,
      label: item.name,
      appId: item.appId,
      external: item.external,
      icon: item.usingWorkflow ? "icon-flowdefault" : "icon-formdefault",
      iconColor: "var(--et-color-primary)",
    }));
}
