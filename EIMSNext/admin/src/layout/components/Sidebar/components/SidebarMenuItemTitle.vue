<template>
  <!-- 根据 icon 类型决定使用的不同类型的图标组件 -->
  <et-icon :icon="icon" class="sub-el-icon" size="14px" :color="iconColor"></et-icon>
  <!-- 菜单标题 -->
  <span v-if="isSidebarOpened && title" class="ml-[5px]">{{ translateRouteTitle(title) }}</span>
</template>

<script setup lang="ts">
import { useSystemStore } from "@/store";
import { translateRouteTitle } from "@/utils/i18n";
defineProps({
  icon: {
    type: String,
    default: "menu",
  },
  iconColor: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
});

const systemStore = useSystemStore();
const isSidebarOpened = computed(() => systemStore.sidebar.opened);
</script>

<style lang="scss" scoped>
.sub-el-icon {
  color: currentcolor;
}
</style>
