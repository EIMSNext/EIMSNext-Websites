<template>
  <div class="et-icon">
    <div class="icon-container">
      <template v-if="icon.startsWith('el-icon-')">
        <el-icon :class="iconClass" :color="color" :size="size">
          <component :is="icon.replace('el-icon-', '')" />
        </el-icon></template>
      <template v-else-if="icon.startsWith('iconfont-')">
        <i :class="'iconfont icon-' + icon.replace('iconfont-', '') + ' ' + iconClass"
          :style="'font-size:' + size + ';color:' + color">
        </i></template>
      <template v-else>
        <SvgIcon :icon="icon" :color="color" :size="size" :iconClass="iconClass" />
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
import "./style/index.less";
import SvgIcon from "./svgIcon.vue";

defineOptions({
  name: "EtIcon",
});

const props = withDefaults(
  defineProps<{
    icon: string;
    color?: string;
    size?: string;
    iconClass?: string;
  }>(),
  {
    color: "#1296db",
    size: "1em",
    iconClass: "",
  }
);
</script>
