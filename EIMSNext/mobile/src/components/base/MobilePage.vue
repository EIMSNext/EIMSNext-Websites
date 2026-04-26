<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left" @click="handleBack">
        <van-icon v-if="backable" name="arrow-left" />
      </div>
      <div class="header-title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div class="header-right">
        <slot name="right" />
      </div>
    </div>
    <div class="page-main">
      <slot />
    </div>
    <div v-if="$slots.footer" class="page-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string;
    backable?: boolean;
  }>(),
  {
    title: "",
    backable: true,
  }
);

const emit = defineEmits<{
  back: [];
}>();

const handleBack = () => {
  if (!props.backable) return;
  emit("back");
};
</script>
