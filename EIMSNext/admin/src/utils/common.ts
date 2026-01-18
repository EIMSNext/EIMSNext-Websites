import {
  App,
  AppMenu,
  AuthGroup,
  AuthGroupType,
  DataPerms,
  FormDef,
  FormType,
  UserType,
} from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import { FlagEnum } from "@eimsnext/utils";

export function getAppIcon(app?: App) {
  let icon = "iconfont-appdefault";
  if (app && app.icon && app.icon != "default") icon = app.icon;

  return icon;
}
export function getAppIconColor(menu?: any) {
  let color = "#1296db";
  if (menu && menu.iconColor) color = menu.iconColor;
  if (menu && menu.menuType && menu.menuType == 2) color = "orange";

  return color;
}

export function getFormIcon(form?: AppMenu) {
  let icon = "iconfont-formdefault";
  if (form) {
    switch (form.menuType) {
      case FormType.Group: {
        icon = "el-icon-folder";
        break;
      }
      case FormType.Dashboard: {
        icon = "iconfont-dshdefault";
        if (form.icon && form.icon != "default") icon = form.icon;
        break;
      }
      default: {
        if (form.icon && form.icon != "default") {
          icon = form.icon || icon;
        } else {
          const formStore = useFormStore();
          let formdef = formStore.items.find((x) => x.id == form.menuId);

          if (formdef) {
            if (formdef.isLedger) icon = "iconfont-ledgerdefault";
            else if (formdef.usingWorkflow) icon = "iconfont-flowdefault";
          }
        }
        break;
      }
    }
  }

  return icon;
}

export function getAuthGroupDataPerms(authGrp?: AuthGroup) {
  if (authGrp) {
    switch (authGrp.type) {
      case AuthGroupType.ManageSelfData:
      case AuthGroupType.ManageAllData:
        return DataPerms.All;
      case AuthGroupType.ViewAllData:
        return DataPerms.View;
      default:
        return authGrp.dataPerms;
    }
  }

  return undefined;
}
export function hasDataPerm(userType: UserType, needPerm: DataPerms, dataPerms?: DataPerms) {
  return (
    userType == UserType.CorpOwmer ||
    userType == UserType.CorpAdmin ||
    (dataPerms && FlagEnum.has(dataPerms, needPerm)) == true
  );
}
