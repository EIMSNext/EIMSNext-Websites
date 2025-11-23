import { App, FormDef, FormType } from "@eimsnext/models";
import { IListItem } from "@eimsnext/components";

export interface IFormItem {
  id: string;
}

// export function buildFormListItems(forms: FormDef[]): IListItem[] {
//   const items: IListItem[] = [];
//   forms.forEach((x) => {
//     let item: IListItem = {
//       id: x.id,
//       label: x.name,
//       data: { id: x.id, appId: x.appId, label: x.name },
//     };

//     items.push(item);
//   });

//   return items;
// }
export function buildFormListItems(app: App): IListItem[] {
  const items: IListItem[] = [];
  app.appMenus.forEach((x) => {
    if (x.menuType == FormType.Form) {
      let item: IListItem = {
        id: x.menuId,
        label: x.title!,
        data: { id: x.menuId, appId: app.id, label: x.title },
      };

      items.push(item);
    }
  });

  return items;
}
