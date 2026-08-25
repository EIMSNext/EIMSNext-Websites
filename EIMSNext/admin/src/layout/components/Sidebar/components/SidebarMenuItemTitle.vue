<template>
  <!-- 根据 icon 类型决定使用的不同类型的图标组件 -->
  <et-icon :icon="icon" class="sub-el-icon" :size="iconSize" :color="iconColor"></et-icon>
  <!-- 菜单标题 -->
  <span
    v-if="isSidebarOpened && title"
    class="menu-item-title ml-[5px]"
    :title="displayTitle"
  >
    {{ displayTitle }}
  </span>
</template>

<script setup lang="ts">
import { useSystemStore } from "@/store";
import { translateRouteTitle } from "@/utils/common";
import { useI18n } from "vue-i18n";
const { t, te } = useI18n()

const props = defineProps({
  icon: {
    type: String,
    default: "menu",
  },
  iconColor: {
    type: String,
    default: "",
  },
  iconSize: {
    type: String,
    default: "14px",
  },
  title: {
    type: String,
    default: "",
  },
});

const systemStore = useSystemStore();
const isSidebarOpened = computed(() => systemStore.sidebar.opened);
const displayTitle = computed(() => translateRouteTitle(t, props.title, te));
</script>

<style lang="scss" scoped>
.sub-el-icon {
  color: currentcolor;
  flex-shrink: 0;
}

.menu-item-title {
  display: block;
  flex: 1;
  max-width: var(--et-size-110);
  min-width: 0;
  overflow: hidden;
  text-overflow: clip;
  white-space: nowrap;
}
</style>
