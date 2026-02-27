import { App, FormDef, FormType } from "@eimsnext/models";

export interface IFormItem {
  id: string;
  label?: string;
  icon?: string;
  iconColor?: string;
}

export interface IFormSelectOptions {
  exclude?: string[];
}

export function buildFormListItems(
  app: App,
  options?: IFormSelectOptions,
): IFormItem[] {
  const items: IFormItem[] = [];
  const exclude = options?.exclude || [];
  app.appMenus.forEach((x) => {
    if (x.menuType == FormType.Form && exclude.indexOf(x.menuId) == -1) {
      let item: IFormItem = {
        id: x.menuId,
        label: x.title!,
        icon:x.icon,
        iconColor: x.iconColor,
      };

      items.push(item);
    }
  });

  return items;
}
