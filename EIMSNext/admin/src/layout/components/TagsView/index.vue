<template>
  <div class="tags-container">
    <el-scrollbar class="scroll-container" :vertical="false" @wheel.prevent="handleScroll">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        custom
        :to="{ path: tag.path, query: tag.query }"
        v-slot="{ navigate }"
      >
        <span
          ref="tagRef"
          :class="'tags-item ' + (tagsViewStore.isActive(tag) ? 'active' : '')"
          :data-affix="isAffix(tag)"
          role="link"
          tabindex="0"
          draggable="false"
          @click="navigate"
          @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''"
          @contextmenu.prevent="openContentMenu(tag, $event)"
          @dragstart.prevent
          @keydown.enter.prevent="navigate"
          @keydown.space.prevent="navigate"
        >
          {{ translateRouteTitle(t, tag.title) }}
          <et-icon
            v-if="!isAffix(tag) || isClosable(tag)"
            icon="el-Close"
            class="tag-close-icon"
            @click.prevent.stop="closeSelectedTag(tag)"
          ></et-icon>
        </span>
      </router-link>
    </el-scrollbar>

    <!-- tag标签操作菜单 -->
    <ul
      v-show="contentMenuVisible"
      class="contextmenu"
      :style="{ left: left + 'px', top: top + 'px' }"
    >
      <!-- <li @click="refreshSelectedTag(selectedTag)">
        <et-icon icon="refresh" />
        刷新
      </li> -->
      <li
        v-if="!isAffix(selectedTag) || isClosable(selectedTag)"
        @click="closeSelectedTag(selectedTag)"
      >
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
import { translateRouteTitle } from "@/utils/common";
import { usePermissionStore, useTagsViewStore, useSettingsStore, useSystemStore } from "@/store";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

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
    const view = {
      name: route.name as string,
      title: route.meta.title,
      path: route.path,
      fullPath: route.fullPath,
      affix: route.meta?.affix,
      keepAlive: route.meta?.keepAlive,
      closable: route.meta.closable,
      query: route.query,
    };
    // 检查视图是否已存在
    const isViewExist = visitedViews.value.some((v) => v.path === view.path);
    if (isViewExist) {
      // 如果视图已存在，只更新属性，不重新添加
      tagsViewStore.updateVisitedView(view);
    } else {
      // 如果视图不存在，添加新视图，tagsViewStore内部会处理路由类型变化的情况
      tagsViewStore.addView(view);
    }
  }
}

function moveToCurrentTag() {
  // 使用 nextTick() 的目的是确保在更新 tagsView 组件之前，scrollPaneRef 对象已经滚动到了正确的位置。
  nextTick(() => {
    // 当查询参数变化时，不更新标签，避免Tab内容明显刷新
    // 只需要确保当前标签是激活状态即可
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
      selectedTag.value.path === "/workspace" ||
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
    router.replace(fullPath);
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
  // top.value = e.clientY;
  // }
  top.value = 37;

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
  height: var(--et-size-42);
  background-color: var(--et-bg-container);
  border: none;
  border-bottom: 1px solid var(--et-border-color-light);
  box-shadow: var(--et-shadow-sm);
  transition: box-shadow var(--et-duration-normal) var(--et-ease-standard);

  &:hover {
    box-shadow: var(--et-shadow-md);
  }

  .tags-item {
    display: inline-flex;
    align-items: center;
    padding: var(--et-space-6) var(--et-space-16);
    margin: var(--et-space-5) 0 0 0;
    font-size: var(--et-font-size-14);
    cursor: pointer;
    border: none;
    background-color: var(--et-bg-container);
    color: var(--et-text-secondary);
    transition:
      color 0.25s var(--et-ease-emphasized),
      background-color 0.25s var(--et-ease-emphasized),
      box-shadow 0.25s var(--et-ease-emphasized);
    position: relative;
    overflow: hidden;
    max-width: var(--et-size-180);
    text-overflow: ellipsis;
    white-space: nowrap;

    &::before {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: var(--et-z-base);
      background-color: transparent;
      transition: background-color 0.25s ease;
    }

    &::after {
      content: "";
      position: absolute;
      right: 0;
      top: var(--et-space-12);
      height: var(--et-size-18);
      width: var(--et-z-base);
      background-color: var(--et-border-color-light);
      opacity: 0.5;
    }

    &:hover {
      color: var(--et-color-primary);
      background-color: var(--et-bg-hover);
      box-shadow: var(--et-shadow-md);
    }

    &:first-of-type {
      margin-left: var(--et-space-16);
    }

    &:last-of-type {
      margin-right: var(--et-space-16);

      &::after {
        display: none;
      }
    }

    .tag-close-icon {
      vertical-align: middle;
      cursor: pointer;
      border-radius: var(--et-radius-round);
      margin-left: var(--et-space-8);
      width: var(--et-size-18);
      height: var(--et-size-18);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: var(--et-font-size-12);
      opacity: 0.6;
      transition: all var(--et-duration-fast) var(--et-ease-standard);

      &:hover {
        color: var(--et-text-on-primary);
        background-color: var(--et-color-primary);
        opacity: 1;
        transform: scale(1.15);
        box-shadow: var(--et-shadow-md);
      }
    }

    &.active {
      color: var(--et-color-primary);
      background-color: var(--et-bg-primary-soft);
      box-shadow: var(--et-shadow-lg);
      font-weight: 500;

      &::before {
        background-color: var(--et-color-primary);
      }

      &:hover {
        color: var(--et-color-primary);
        background-color: var(--et-bg-primary-soft);
        transform: none;
      }

      .tag-close-icon {
        opacity: 0.7;

        &:hover {
          color: var(--et-text-on-primary);
          background-color: var(--et-color-primary);
        }
      }
    }

    // 固定标签样式
    &.tags-item[data-affix="true"] {
      font-weight: 500;
      color: var(--et-text-primary);

      &:hover {
        color: var(--et-text-primary);
        background-color: var(--et-bg-hover);
      }

      &.active {
        color: var(--et-color-primary);
        background-color: var(--et-bg-primary-soft);
      }
    }
  }
}

.contextmenu {
  position: absolute;
  z-index: var(--et-z-overlay);
  font-size: var(--et-font-size-13);
  background: var(--et-bg-elevated);
  box-shadow: var(--et-shadow-overlay);
  border: 1px solid var(--et-border-color-light);
  padding: var(--et-space-6) 0;
  min-width: var(--et-size-130);
  backdrop-filter: var(--et-blur-overlay);

  li {
    padding: var(--et-space-9) var(--et-space-18);
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all var(--et-duration-fast) var(--et-ease-standard);

    et-icon {
      margin-right: var(--et-space-8);
      font-size: var(--et-font-size-15);
    }

    &:hover {
      background-color: var(--et-bg-hover);
      color: var(--et-color-primary);
    }

    &:not(:last-child) {
      border-bottom: 1px solid transparent;
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
    height: var(--et-space-4);

    &.is-vertical {
      display: none;
    }

    .el-scrollbar__thumb {
      background-color: rgb(144 147 153 / 30%);
      border-radius: var(--et-radius-2);
      transition: background-color var(--et-duration-normal) var(--et-ease-standard);

      &:hover {
        background-color: rgb(144 147 153 / 50%);
      }
    }
  }

  .el-scrollbar__wrap {
    height: var(--et-size-52);
    padding-bottom: var(--et-space-12);
  }
}

// 动画效果增强
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.contextmenu {
  animation: fadeIn 0.15s ease forwards;
}
</style>
