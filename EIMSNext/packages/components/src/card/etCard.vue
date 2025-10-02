<template>
  <el-card class="et-card">
    <template v-if="showHeader" #header>
      <div class="flex-x-between">
        <slot name="header">
          <div class="flex-y-center">
            <slot name="title">{{ title }}</slot>
          </div>
          <div class="">
            <slot name="action"></slot>
          </div>
        </slot>
      </div>
    </template>

    <slot></slot>
  </el-card>
</template>
<script setup lang="ts">
import "./style/index.less"

defineOptions({
  name: "EtCard",
});
const props = withDefaults(
  defineProps<{
    title?: string;
    showHeader?: boolean;
  }>(),
  {
    title: "",
    showHeader: true,
  }
);
</script>
