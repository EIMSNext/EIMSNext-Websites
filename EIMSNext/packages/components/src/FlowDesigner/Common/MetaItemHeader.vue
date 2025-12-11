<template>
  <div class="item-header">
    <span class="title">
      <span v-if="required" class="required">*</span>
      {{ label }}
    </span>
    <el-tooltip v-if="tips" effect="dark" :content="tips" placement="top-start">
      <el-icon class="help-icon"><QuestionFilled /></el-icon>
    </el-tooltip>
  </div>
</template>
<script lang="ts" setup>
defineOptions({
  name: "MetaItemHeader",
});

const props = withDefaults(
  defineProps<{
    label: string;
    required?: boolean;
    tips?: string;
  }>(),
  { required: false }
);
</script>
