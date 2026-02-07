import { DataItemType } from "@/common";
import { IListItem } from "@/list/type";
import { App, FormDef, FormType } from "@eimsnext/models";

export interface IFormItem {
  id: string;
  label?: string;
  icon?: string;
  color?: string;
}

export function buildFormListItems(app: App): IFormItem[] {
  const items: IFormItem[] = [];
  app.appMenus.forEach((x) => {
    if (x.menuType == FormType.Form) {
      let item: IFormItem = {
        id: x.menuId,
        label: x.title!,
        data: { id: x.menuId, appId: app.id, label: x.title },
        type: DataItemType.Form,
      };

      items.push(item);
    }
  });

  return items;
}
