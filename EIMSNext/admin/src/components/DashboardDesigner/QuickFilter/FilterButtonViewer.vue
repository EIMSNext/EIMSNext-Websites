<template>
  <div class="filter-button-viewer">
    <el-button type="primary" @click="emit('apply')">
      {{ t('common.filter') }}
      <et-icon icon="el-check" />
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const emit = defineEmits<{ apply: [] }>();
const { t } = useI18n();
</script>

<style scoped lang="scss">
.filter-button-viewer { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.filter-button-viewer :deep(.el-button) { min-width: 108px; }
</style>
