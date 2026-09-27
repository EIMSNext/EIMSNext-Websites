import {
  AppDef,
  AppMenu,
  FormDataPermissionGroup,
  FormDataPermissionMode,
  FormDataPermissions,
  FormDef,
  FormType,
} from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import { appSetting, FlagEnum } from "@eimsnext/utils";
import dayjs from "dayjs";

export function getFormDataPermissionGroupFormDataPermissions(permissionGroup?: FormDataPermissionGroup) {
  if (permissionGroup) {
    switch (permissionGroup.type) {
      case FormDataPermissionMode.ManageSelfData:
      case FormDataPermissionMode.ManageAllData:
        return FormDataPermissions.All;
      case FormDataPermissionMode.ViewAllData:
        return FormDataPermissions.View;
      default:
        return permissionGroup.formDataPermissions;
    }
  }

  return undefined;
}
export function hasDataPerm(needPerm: FormDataPermissions, formDataPermissions?: FormDataPermissions) {
  return (formDataPermissions && FlagEnum.has(formDataPermissions, needPerm)) == true;
}

export function getAppIcon(app?: AppDef) {
  let icon = "icon-appdefault";
  if (app && app.icon && app.icon != "default") icon = app.icon;

  return icon;
}
export function getAppIconColor(menu?: any) {
  let color = "var(--et-color-primary)";
  if (menu && menu.iconColor) color = menu.iconColor;

  return color;
}

export function getAppIconTextColor(menu?: any) {
  return "var(--el-color-white, #fff)";
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

