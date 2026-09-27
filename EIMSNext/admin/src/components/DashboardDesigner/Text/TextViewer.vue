<template>
  <div v-if="hasContent" class="dashboard-text-viewer" v-html="setting.html"></div>
  <el-empty v-else class="dashboard-text-empty" :description="t('admin.dashboardDesigner.noText')" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { IDashboardTextSetting } from "./type";

const props = defineProps<{ setting: IDashboardTextSetting }>();
const { t } = useI18n();
const hasContent = computed(() => props.setting.html.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").trim().length > 0);
</script>

<style scoped lang="scss">
.dashboard-text-viewer { width: 100%; height: 100%; padding: var(--et-space-16); overflow: auto; box-sizing: border-box; color: var(--et-text-primary); word-break: break-word; }.dashboard-text-viewer :deep(p) { margin: 0 0 var(--et-space-10); }.dashboard-text-viewer :deep(a) { color: var(--et-color-primary); text-decoration: underline; }.dashboard-text-empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
</style>
