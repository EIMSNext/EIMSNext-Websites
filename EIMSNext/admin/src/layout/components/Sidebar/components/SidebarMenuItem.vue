<template>
  <form-edit v-if="showFormEditor" :formId="selectedFormId" :usingFlow="usingWorkflow" :isLedger="isLedger"
    @close="closeEditor" />
  <div v-if="!item.meta || !item.meta.hidden">
    <!--【叶子节点】显示叶子节点或唯一子节点且父节点未配置始终显示 -->
    <template v-if="
      // 判断条件：仅有一个子节点，且父节点未配置始终显示
      (hasOneShowingChild(item.children, item) &&
        (!onlyOneChild.children || onlyOneChild.noShowingChildren) &&
        !item.meta?.alwaysShow) ||
      // 父节点即使配置了始终显示，但无子节点，也显示为叶子节点
      (item.meta?.alwaysShow && !item.children)
    ">
      <AppLink v-if="onlyOneChild.meta" :to="{
        path: resolvePath(onlyOneChild.path),
        query: onlyOneChild.meta.params,
      }">
        <el-menu-item :index="resolvePath(onlyOneChild.path)">
          <SidebarMenuItemTitle :icon="onlyOneChild.meta.icon || item.meta?.icon" :title="onlyOneChild.meta.title"
            :iconColor="item.meta?.iconColor" />
          <span class="more-wrapper">
            <el-dropdown placement="bottom-start" size="large">
              <et-icon icon="el-icon-More"></et-icon>
              <template #dropdown>
                <el-dropdown-menu style="min-width: 150px">
                  <el-dropdown-item @click="editForm(item.meta?.id)">编辑</el-dropdown-item>
                  <el-dropdown-item @click="editForm(item.meta?.id)">
                    修改名称和图标
                  </el-dropdown-item>
                  <el-divider style="margin: 3px 0" />
                  <el-dropdown-item @click="deleteForm(item.meta?.id)">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </span>
        </el-menu-item>
      </AppLink>
    </template>

    <!--【非叶子节点】显示含多个子节点的父菜单，或始终显示的单子节点 -->
    <el-sub-menu v-else :index="resolvePath(item.path)" teleported>
      <template #title>
        <SidebarMenuItemTitle v-if="item.meta" :icon="item.meta.icon" :title="item.meta.title"
          :iconColor="item.meta?.iconColor" />
      </template>

      <SidebarMenuItem v-for="child in item.children" :key="child.path" :is-nest="true" :item="child"
        :base-path="resolvePath(child.path)" />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "SidebarMenuItem",
  inheritAttrs: false,
});

import path from "path-browserify";
import { RouteMeta, RouteRecordRaw } from "vue-router";
import { isExternal } from "@/utils";
import { useFormStore } from "@eimsnext/store";
import { FormDef } from "@eimsnext/models";

const props = defineProps({
  /**
   * 当前路由对象
   */
  item: {
    type: Object as PropType<RouteRecordRaw>,
    required: true,
  },

  /**
   * 父级完整路径
   */
  basePath: {
    type: String,
    required: true,
  },

  /**
   * 是否为嵌套路由
   */
  isNest: {
    type: Boolean,
    default: false,
  },
});

const formStore = useFormStore();
// 可见的唯一子节点
const onlyOneChild = ref();
const selectedFormId = ref("");
const showFormEditor = ref(false);
const usingWorkflow = ref(false);
const isLedger = ref(false);
/**
 * 检查是否仅有一个可见子节点
 *
 * @param children 子路由数组
 * @param parent 父级路由
 * @returns 是否仅有一个可见子节点
 */
function hasOneShowingChild(children: RouteRecordRaw[] = [], parent: RouteRecordRaw) {
  // 过滤出可见子节点
  const showingChildren = children.filter((route: RouteRecordRaw) => {
    if (!route.meta?.hidden) {
      onlyOneChild.value = route;
      return true;
    }
    return false;
  });

  // 仅有一个或无子节点
  if (showingChildren.length === 1) {
    return true;
  }

  // 无子节点时，设置父节点为唯一显示节点
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: "", noShowingChildren: true };
    return true;
  }
  return false;
}

/**
 * 获取完整路径，适配外部链接
 *
 * @param routePath 路由路径
 * @returns 绝对路径
 */
function resolvePath(routePath: string) {
  if (isExternal(routePath)) return routePath;
  if (isExternal(props.basePath)) return props.basePath;

  // 拼接父路径和当前路径
  return path.resolve(props.basePath, routePath);
}
/**
 * 编辑表单
 */
async function editForm(formId?: string) {
  if (formId) {
    let form = await formStore.get(formId);
    if (form) {
      selectedFormId.value = formId;
      usingWorkflow.value = form.usingWorkflow;
      isLedger.value = form.isLedger;
      showFormEditor.value = true;
    }
  }
}
function deleteForm(formId?: string) {
  if (formId) {
    selectedFormId.value = formId;
    showFormEditor.value = true;
  }
}

function closeEditor() {
  showFormEditor.value = false;
}
</script>

<style lang="scss" scoped>
.hideSidebar {
  .el-menu--collapse {
    width: $sidebar-width-collapsed;

    .el-sub-menu {
      &>.el-sub-menu__title>span {
        display: inline-block;
        width: 0;
        height: 0;
        overflow: hidden;
      }
    }
  }
}

.el-menu-item:hover {
  background-color: $menu-hover;
}

.more-wrapper {
  position: absolute;
  right: 10px;
  display: flex;
}
</style>
