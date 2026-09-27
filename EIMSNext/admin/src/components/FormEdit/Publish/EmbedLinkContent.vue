<template>
  <div class="embed-body">
    <p class="embed-desc">{{ description }}</p>
    <div class="embed-row">
      <label class="embed-label">{{ t("publicpublish.embedLink") }}</label>
      <el-input :model-value="url" readonly>
        <template #append>
          <el-button class="embed-copy-btn" @click="copyText(url)">
            {{ t("common.copy") }}
          </el-button>
        </template>
      </el-input>
    </div>
    <div class="embed-row">
      <label class="embed-label">{{ t("publicpublish.embedCode") }}</label>
      <el-input :model-value="iframeCode" readonly>
        <template #append>
          <el-button class="embed-copy-btn" @click="copyText(iframeCode)">
            {{ t("common.copy") }}
          </el-button>
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  url: string;
  description: string;
}>();

const { t } = useI18n();

const iframeCode = computed(
  () => `<iframe width="100%" height="100%" style="border: none;" src="${props.url}"></iframe>`
);

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
  ElMessage.success(t("common.copied"));
}
</script>

<style scoped lang="scss">
.embed-body {
  padding: var(--et-space-20);
  min-height: 200px;
}

.embed-desc {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-13);
  margin-bottom: var(--et-space-12);
}

.embed-row {
  align-items: center;
  display: grid;
  gap: var(--et-space-12);
  grid-template-columns: 98px minmax(0, 1fr);
  margin-bottom: var(--et-space-12);
}

.embed-label {
  color: var(--et-text-primary);
  font-size: var(--et-font-size-13);
  font-weight: 600;
}

:deep(.el-input-group__append .embed-copy-btn) {
  border-color: var(--el-button-border-color, var(--el-border-color));
  background-color: var(--el-button-bg-color, var(--el-fill-color-blank));
  color: var(--el-button-text-color, var(--el-text-color-regular));

  &:hover,
  &:focus-visible {
    border-color: var(--el-button-hover-border-color, var(--el-color-primary));
    background-color: var(--el-button-hover-bg-color, var(--el-color-primary-light-9));
    color: var(--el-button-hover-text-color, var(--el-color-primary));
  }
}
</style>
