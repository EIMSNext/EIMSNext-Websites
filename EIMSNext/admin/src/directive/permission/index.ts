import type { Directive, DirectiveBinding } from "vue";

import { useUserStore } from "@eimsnext/store";
import { AuthGroup, DataPerms, UserType } from "@eimsnext/models";
import { FlagEnum } from "@eimsnext/utils";

export interface PermContext {
  dataPerms?: DataPerms;
  needPerm: DataPerms;
}

/**
 * 按钮权限
 */
export const hasPerm: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<PermContext>) {
    const context = binding.value;
    const { currentUser } = storeToRefs(useUserStore());

    return (
      (currentUser.value.userType == UserType.CorpOwmer ||
        currentUser.value.userType == UserType.CorpAdmin ||
        (context.dataPerms && FlagEnum.has(context.dataPerms, context.needPerm))) == true
    );
  },
};

/**
 * 角色权限指令
 */
export const hasRole: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const requiredRoles = binding.value;

    return;

    // // 校验传入的角色值是否合法
    // if (!requiredRoles || (typeof requiredRoles !== "string" && !Array.isArray(requiredRoles))) {
    //   throw new Error(
    //     "需要提供角色标识！例如：v-has-role=\"'ADMIN'\" 或 v-has-role=\"['ADMIN', 'TEST']\""
    //   );
    // }

    // const { roles } = useUserStore().currentUser;

    // // 检查是否有对应角色权限
    // const hasAuth = Array.isArray(requiredRoles)
    //   ? requiredRoles.some((role) => roles.includes(role))
    //   : roles.includes(requiredRoles);

    // // 如果没有权限，移除元素
    // if (!hasAuth && el.parentNode) {
    //   el.parentNode.removeChild(el);
    // }
  },
};
