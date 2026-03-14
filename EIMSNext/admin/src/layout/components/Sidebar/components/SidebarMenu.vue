<!-- 菜单组件 -->
<template>
  <el-menu :default-active="currentRoute.path" :collapse="!systemStore.sidebar.opened"
    :background-color="variables['menu-background']" :text-color="variables['menu-text']"
    :active-text-color="variables['menu-active-text']" :unique-opened="false" :collapse-transition="false"
    mode="vertical" style="width: 100%;" @open="onMenuOpen" @close="onMenuClose">
    <!-- 菜单项 -->
    <SidebarMenuItem v-for="route in appMenus" :key="route.path" :item="route" :base-path="resolveFullPath(route.path)"
      @editForm="editForm" />
  </el-menu>
</template>

<script lang="ts" setup>
import path from "path-browserify";
import { useSystemStore, } from "@/store";
import { isExternal } from "@/utils/index";

import variables from "@/styles/variables.module.scss";
import { FormType } from "@eimsnext/models";

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

const systemStore = useSystemStore();
const currentRoute = useRoute();
const appMenus = toRef(props.menuList)

// 存储已展开的菜单项索引
const expandedMenuIndexes = ref<string[]>([]);
watch(() => props.menuList,
  () => {
    appMenus.value = props.menuList
  },
  { immediate: true }
)
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

const emit = defineEmits(["editForm"]);
function editForm(formId: string, type: FormType) {
  emit("editForm", formId, type)
}
</script>
