<template>
  <div class="et-icon">
    <div class="icon-container">
      <template v-if="icon.startsWith('el-')">
        <el-icon :class="iconClass" :color="color" :size="size">
          <component :is="icon.replace('el-', '')" />
        </el-icon></template>
      <template v-else-if="icon.startsWith('icon-')">
        <i :class="'iconfont ' + icon + ' ' + iconClass" :style="'font-size:' + size + ';color:' + color">
        </i></template>
      <template v-else-if="icon.startsWith('fc-')">
        <i :class="'fc-icon ' + icon.replace('fc-', '') + ' ' + iconClass"
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
    color: "currentcolor",
    size: "1em",
    iconClass: "",
  }
);
</script>
