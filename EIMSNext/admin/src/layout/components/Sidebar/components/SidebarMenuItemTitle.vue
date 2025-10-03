<template>
  <!-- 根据 icon 类型决定使用的不同类型的图标组件 -->
  <et-icon :icon="icon" class="sub-el-icon" size="16px" :color="iconColor"></et-icon>
  <!-- 菜单标题 -->
  <span v-if="title" class="ml-[5px]">{{ translateRouteTitle(title) }}</span>
</template>

<script setup lang="ts">
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
</script>

<style lang="scss" scoped>
.sub-el-icon {
  color: currentcolor;
}

.hideSidebar {
  .el-sub-menu,
  .el-menu-item {
    .svg-icon,
    .sub-el-icon {
      margin-left: 20px;
    }
  }
}
</style>
