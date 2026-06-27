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
  app.appMenus.forEach((x) => {
    if (x.menuType == FormType.Form && exclude.indexOf(x.menuId) == -1) {
      let item: IFormItem = {
        id: x.menuId,
        label: x.title!,
        icon: x.icon,
        iconColor: x.iconColor,
      };

      items.push(item);
    }
  });

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
    }));
}
