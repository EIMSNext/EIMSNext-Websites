import { FormDef } from "@eimsnext/models";
import { IListItem } from "@eimsnext/components";

export interface IFormItem {
  id: string;
}

export function buildFormListItems(forms: FormDef[]): IListItem[] {
  const items: IListItem[] = [];
  forms.forEach((x) => {
    let item: IListItem = {
      id: x.id,
      label: x.name,
      data: { id: x.id, appId: x.appId, label: x.name },
    };

    items.push(item);
  });

  return items;
}
