<!-- 菜单组件 -->
<template>
  <el-menu ref="menuRef" :default-active="currentRoute.path" :collapse="!systemStore.sidebar.opened"
    :background-color="variables['menu-background']" :text-color="variables['menu-text']"
    :active-text-color="variables['menu-active-text']" :unique-opened="false" :collapse-transition="false"
    mode="vertical" style="width: 100%;" @open="onMenuOpen" @close="onMenuClose">
    <!-- 菜单项 -->
    <SidebarMenuItem v-for="route in appMenus" :key="route.path" :item="route"
      :base-path="resolveFullPath(route.path)" />
  </el-menu>
</template>

<script lang="ts" setup>
import path from "path-browserify";
import { storeToRefs } from "pinia";
import type { MenuInstance } from "element-plus";

import { useSystemStore, usePermissionStore } from "@/store";
import { isExternal } from "@/utils/index";

import variables from "@/styles/variables.module.scss";

const props = defineProps({
  menuList: {
    type: Array<any>,
    required: true,
  },
  basePath: {
    type: String,
    required: true,
    example: "/",
  },
});

const menuRef = ref<MenuInstance>();
const systemStore = useSystemStore();
const currentRoute = useRoute();
const { appMenus } = storeToRefs(usePermissionStore());

// 存储已展开的菜单项索引
const expandedMenuIndexes = ref<string[]>([]);

/**
 * 获取完整路径
 *
 * @param routePath 当前路由的相对路径  /user
 * @returns 完整的绝对路径 D://vue3-element-admin/system/user
 */
function resolveFullPath(routePath: string) {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }

  // 解析路径，生成完整的绝对路径
  return path.resolve(props.basePath, routePath);
}

/**
 * 打开菜单
 *
 * @param index 当前展开的菜单项索引
 */
const onMenuOpen = (index: string) => {
  expandedMenuIndexes.value.push(index);
};

/**
 * 关闭菜单
 *
 * @param index 当前收起的菜单项索引
 */
const onMenuClose = (index: string) => {
  expandedMenuIndexes.value = expandedMenuIndexes.value.filter((item) => item !== index);
};
</script>
