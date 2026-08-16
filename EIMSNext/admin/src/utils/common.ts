import {
  AppDef,
  AppMenu,
  AuthGroup,
  AuthGroupType,
  DataPerms,
  FormDef,
  FormType,
} from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import { appSetting, FlagEnum } from "@eimsnext/utils";
import dayjs from "dayjs";

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
export function hasDataPerm(needPerm: DataPerms, dataPerms?: DataPerms) {
  return (dataPerms && FlagEnum.has(dataPerms, needPerm)) == true;
}

export function getAppIcon(app?: AppDef) {
  let icon = "icon-appdefault";
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
  let icon = "icon-formdefault";
  if (form) {
    const menuType = (() => {
      if (form.menuType === undefined) return FormType.Form;
      if (typeof form.menuType === 'string') return form.menuType as FormType;
      return String(form.menuType) as FormType;
    })();
    
    switch (menuType) {
      case FormType.Group: {
        icon = "el-folder";
        break;
      }
      case FormType.Dashboard: {
        icon = "icon-dshdefault";
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
            if (formdef.usingWorkflow) icon = "icon-flowdefault";
          }
        }
        break;
      }
    }
  }

  return icon;
}

export function getObjectType(obj: any) {
  if (Object.prototype.toString.call(obj) === "[object String]") {
    return "String";
  } else if (Object.prototype.toString.call(obj) === "[object Object]") {
    return "Object";
  } else if (Object.prototype.toString.call(obj) === "[object Array]") {
    return "Array";
  } else if (Object.prototype.toString.call(obj) === "[object Number]") {
    return "Number";
  } else if (Object.prototype.toString.call(obj) === "[object Boolean]") {
    return "Boolean";
  }
}

export function getAttachmentRootPath() {
  return appSetting.uploadUrl;
}

export function dateFormat(val: any, fmt?: string) {
  const format = (fmt || "YYYY-MM-DD")
    .replace(/yyyy/g, "YYYY")
    .replace(/(?<!d)dd(?!d)/g, "DD");
  return val ? dayjs(val).format(format) : "";
}

export function translateRouteTitle(t: any, title: string, te?: (key: string) => boolean) {
  if (!title || typeof te !== "function") return title;
  if (te(title)) return t(title);

  const routeKey = `route.${title}`;
  return te(routeKey) ? t(routeKey) : title;
}
