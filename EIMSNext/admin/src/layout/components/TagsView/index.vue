<template>
  <div class="tags-container">
    <el-scrollbar class="scroll-container" :vertical="false" @wheel.prevent="handleScroll">
      <router-link v-for="tag in visitedViews" ref="tagRef" :key="tag.fullPath"
        :class="'tags-item ' + (tagsViewStore.isActive(tag) ? 'active' : '')" :to="{ path: tag.path, query: tag.query }"
        @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''" @contextmenu.prevent="openContentMenu(tag, $event)">
        {{ translateRouteTitle(tag.title) }}
        <et-icon v-if="!isAffix(tag) || isClosable(tag)" icon="el-icon-Close" class="tag-close-icon"
          @click.prevent.stop="closeSelectedTag(tag)"></et-icon>
      </router-link>
    </el-scrollbar>

    <!-- tag标签操作菜单 -->
    <ul v-show="contentMenuVisible" class="contextmenu" :style="{ left: left + 'px', top: top + 'px' }">
      <li @click="refreshSelectedTag(selectedTag)">
        <et-icon icon="refresh" />
        刷新
      </li>
      <li v-if="!isAffix(selectedTag) || isClosable(selectedTag)" @click="closeSelectedTag(selectedTag)">
        <et-icon icon="close" />
        关闭
      </li>
      <li @click="closeOtherTags">
        <et-icon icon="close_other" />
        关闭其它
      </li>
      <li v-if="!isFirstView()" @click="closeLeftTags">
        <et-icon icon="close_left" />
        关闭左侧
      </li>
      <li v-if="!isLastView()" @click="closeRightTags">
        <et-icon icon="close_right" />
        关闭右侧
      </li>
      <li @click="closeAllTags(selectedTag)">
        <et-icon icon="close_all" />
        关闭所有
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter, RouteRecordRaw } from "vue-router";
import { resolve } from "path-browserify";
import { translateRouteTitle } from "@/utils/i18n";

import { usePermissionStore, useTagsViewStore, useSettingsStore, useSystemStore } from "@/store";

const { proxy } = getCurrentInstance()!;
const router = useRouter();
const route = useRoute();

const permissionStore = usePermissionStore();
const tagsViewStore = useTagsViewStore();
const systemStore = useSystemStore();

const { visitedViews } = storeToRefs(tagsViewStore);
const settingsStore = useSettingsStore();
// const layout = computed(() => settingsStore.layout);

const selectedTag = ref<TagView>({
  path: "",
  fullPath: "",
  name: "",
  title: "",
  affix: false,
  keepAlive: false,
});

const affixTags = ref<TagView[]>([]);
const left = ref(0);
const top = ref(0);

watch(
  route,
  () => {
    addTags();
    moveToCurrentTag();
  },
  {
    immediate: true, //初始化立即执行
  }
);

const contentMenuVisible = ref(false); // 右键菜单是否显示
watch(contentMenuVisible, (value) => {
  if (value) {
    document.body.addEventListener("click", closeContentMenu);
  } else {
    document.body.removeEventListener("click", closeContentMenu);
  }
});

/**
 * 过滤出需要固定的标签
 */
function filterAffixTags(routes: RouteRecordRaw[], basePath = "/") {
  let tags: TagView[] = [];
  routes.forEach((route: RouteRecordRaw) => {
    const tagPath = resolve(basePath, route.path);
    if (route.meta?.affix) {
      tags.push({
        path: tagPath,
        fullPath: tagPath,
        name: String(route.name),
        title: route.meta?.title || "no-name",
        affix: route.meta?.affix,
        keepAlive: route.meta?.keepAlive,
        closable: route.meta?.closable,
      });
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, basePath + route.path);
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags];
      }
    }
  });
  return tags;
}

function initTags() {
  const tags: TagView[] = filterAffixTags(permissionStore.routes);
  affixTags.value = tags;
  for (const tag of tags) {
    // Must have tag name
    if (tag.name) {
      tagsViewStore.addVisitedView(tag);
    }
  }
}

function addTags() {
  if (route.meta.title) {
    tagsViewStore.addView({
      name: route.name as string,
      title: route.meta.title,
      path: route.path,
      fullPath: route.fullPath,
      affix: route.meta?.affix,
      keepAlive: route.meta?.keepAlive,
      closable: route.meta.closable,
      query: route.query,
    });
  }
}

function moveToCurrentTag() {
  // 使用 nextTick() 的目的是确保在更新 tagsView 组件之前，scrollPaneRef 对象已经滚动到了正确的位置。
  nextTick(() => {
    for (const tag of visitedViews.value) {
      if (tag.path === route.path) {
        // when query is different then update
        // route.query = { ...route.query, ...tag.query };
        if (tag.fullPath !== route.fullPath) {
          tagsViewStore.updateVisitedView({
            name: route.name as string,
            title: route.meta.title || "",
            path: route.path,
            fullPath: route.fullPath,
            affix: route.meta?.affix,
            keepAlive: route.meta?.keepAlive,
            closable: route.meta?.closable,
            query: route.query,
          });
        }
      }
    }
  });
}

function isAffix(tag: TagView) {
  return tag?.affix;
}
function isClosable(tag: TagView) {
  return tag?.closable;
}
function isFirstView() {
  try {
    return (
      selectedTag.value.path === "/dashboard" ||
      selectedTag.value.fullPath === tagsViewStore.visitedViews[1].fullPath
    );
  } catch (err) {
    return false;
  }
}

function isLastView() {
  try {
    return (
      selectedTag.value.fullPath ===
      tagsViewStore.visitedViews[tagsViewStore.visitedViews.length - 1].fullPath
    );
  } catch (err) {
    return false;
  }
}

function refreshSelectedTag(view: TagView) {
  tagsViewStore.delCachedView(view);
  const { fullPath } = view;
  nextTick(() => {
    router.replace("/redirect" + fullPath);
  });
}

function closeSelectedTag(view: TagView) {
  tagsViewStore.delView(view).then((res: any) => {
    if (tagsViewStore.isActive(view)) {
      tagsViewStore.toLastView(res.visitedViews, view);
    }
  });
}

function closeLeftTags() {
  tagsViewStore.delLeftViews(selectedTag.value).then((res: any) => {
    if (!res.visitedViews.find((item: any) => item.path === route.path)) {
      tagsViewStore.toLastView(res.visitedViews);
    }
  });
}
function closeRightTags() {
  tagsViewStore.delRightViews(selectedTag.value).then((res: any) => {
    if (!res.visitedViews.find((item: any) => item.path === route.path)) {
      tagsViewStore.toLastView(res.visitedViews);
    }
  });
}

function closeOtherTags() {
  router.push(selectedTag.value);
  tagsViewStore.delOtherViews(selectedTag.value).then(() => {
    moveToCurrentTag();
  });
}

function closeAllTags(view: TagView) {
  tagsViewStore.delAllViews().then((res: any) => {
    tagsViewStore.toLastView(res.visitedViews, view);
  });
}

/**
 * 打开右键菜单
 */
function openContentMenu(tag: TagView, e: MouseEvent) {
  const menuMinWidth = 105;

  const offsetLeft = proxy?.$el.getBoundingClientRect().left; // container margin left
  const offsetWidth = proxy?.$el.offsetWidth; // container width
  const maxLeft = offsetWidth - menuMinWidth; // left boundary
  const l = e.clientX - offsetLeft + 15; // 15: margin right

  if (l > maxLeft) {
    left.value = maxLeft;
  } else {
    left.value = l;
  }

  // 混合模式下，需要减去顶部菜单(fixed)的高度
  // if (layout.value === "mix") {
  //   top.value = e.clientY - 50;
  // } else {
  top.value = e.clientY;
  // }

  contentMenuVisible.value = true;
  selectedTag.value = tag;
}

/**
 * 关闭右键菜单
 */
function closeContentMenu() {
  contentMenuVisible.value = false;
}

/**
 * 滚动事件
 */
function handleScroll() {
  closeContentMenu();
}

function findOutermostParent(tree: any[], findName: string) {
  let parentMap: any = {};

  function buildParentMap(node: any, parent: any) {
    parentMap[node.name] = parent;

    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        buildParentMap(node.children[i], node);
      }
    }
  }

  for (let i = 0; i < tree.length; i++) {
    buildParentMap(tree[i], null);
  }

  let currentNode = parentMap[findName];
  while (currentNode) {
    if (!parentMap[currentNode.name]) {
      return currentNode;
    }
    currentNode = parentMap[currentNode.name];
  }

  return null;
}
onMounted(() => {
  initTags();
});
</script>

<style lang="scss" scoped>
.tags-container {
  width: 100%;
  height: 36px;
  background-color: var(--el-bg-color);
  border: none;
  border-bottom: 1px solid var(--el-border-color-light);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  .tags-item {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    margin: 4px 0 0 8px;
    font-size: 13px;
    cursor: pointer;
    border: 1px solid transparent;
    border-radius: 4px 4px 0 0;
    background-color: var(--el-bg-color);
    color: var(--el-text-color-regular);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    max-width: 160px;
    text-overflow: ellipsis;
    white-space: nowrap;

    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: transparent;
      transition: background-color 0.25s ease;
    }

    &:hover {
      color: var(--el-color-primary);
      border-color: var(--el-border-color-hover);
      background-color: var(--el-fill-color-light);
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    &:first-of-type {
      margin-left: 12px;
    }

    &:last-of-type {
      margin-right: 12px;
    }

    .tag-close-icon {
      vertical-align: middle;
      cursor: pointer;
      border-radius: 50%;
      margin-left: 6px;
      width: 16px;
      height: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      opacity: 0.7;
      transition: all 0.2s ease;

      &:hover {
        color: #fff;
        background-color: var(--el-color-primary);
        opacity: 1;
        transform: scale(1.1);
      }
    }

    &.active {
      color: var(--el-color-primary);
      background-color: #fff;
      border-color: var(--el-border-color-light) var(--el-border-color-light) transparent;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      font-weight: 500;

      &::before {
        background-color: var(--el-color-primary);
      }

      &:hover {
        color: var(--el-color-primary);
        border-color: var(--el-border-color-light) var(--el-border-color-light) transparent;
        background-color: #fff;
        transform: none;
      }

      .tag-close-icon {
        opacity: 0.8;

        &:hover {
          color: #fff;
          background-color: var(--el-color-primary);
        }
      }
    }

    // 固定标签样式
    &.tags-item[data-affix="true"] {
      font-weight: 500;
      color: var(--el-text-color-primary);

      &:hover {
        color: var(--el-text-color-primary);
        background-color: var(--el-fill-color-light);
      }

      &.active {
        color: var(--el-color-primary);
      }
    }
  }
}

.contextmenu {
  position: absolute;
  z-index: 9999;
  font-size: 12px;
  background: var(--el-bg-color-overlay);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--el-border-color-light);
  padding: 4px 0;
  min-width: 120px;
  backdrop-filter: blur(8px);

  li {
    padding: 8px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background-color 0.2s ease;

    et-icon {
      margin-right: 6px;
      font-size: 14px;
    }

    &:hover {
      background-color: var(--el-fill-color-light);
      color: var(--el-color-primary);
    }

    &:not(:last-child) {
      border-bottom: 1px solid var(--el-border-color-transparent);
    }
  }
}

.scroll-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;

  .el-scrollbar__bar {
    bottom: 0;
    height: 4px;

    &.is-vertical {
      display: none;
    }

    .el-scrollbar__thumb {
      background-color: rgba(144, 147, 153, 0.3);
      border-radius: 2px;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: rgba(144, 147, 153, 0.5);
      }
    }
  }

  .el-scrollbar__wrap {
    height: 49px;
    padding-bottom: 12px;
  }
}

// 动画效果增强
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.contextmenu {
  animation: fadeIn 0.15s ease forwards;
}

.tags-item {
  animation: fadeIn 0.2s ease forwards;
}
</style>