<template>
  <el-drawer
    :model-value="modelValue"
    :size="drawerSize"
    destroy-on-close
    class="pdf-preview-drawer"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="pdf-preview-header">
        <div class="pdf-preview-title">{{ title }}</div>
        <div class="pdf-preview-tools">
          <el-button
            text
            bg
            class="pdf-preview-tool-btn pdf-preview-tool-action"
            @click="handleDownload"
            :disabled="!pdfUrl"
          >
            下载
          </el-button>
        </div>
      </div>
    </template>
    <div class="pdf-preview-body">
      <iframe v-if="pdfUrl" :src="pdfUrl" class="pdf-preview-iframe" />
      <div v-else class="pdf-preview-empty">
        <div class="pdf-preview-empty-text">{{ emptyText }}</div>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
defineOptions({
  name: "PdfPreview",
});

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    pdfUrl: string;
    title: string;
  }>(),
  {
    modelValue: false,
    pdfUrl: "",
    title: "",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const drawerSize = "92%";
const emptyText = "暂无预览内容";

const handleDownload = async () => {
  if (!props.pdfUrl) return;

  try {
    const response = await fetch(props.pdfUrl);
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = objectUrl;
    link.download = props.title || "download.pdf";
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(objectUrl);
    document.body.removeChild(link);
  } catch (error) {
    console.error("下载失败", error);
  }
};
</script>

<style lang="scss" scoped>
.pdf-preview-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--et-space-12);
}

.pdf-preview-title {
  font-weight: 600;
  color: #f5f7fa;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pdf-preview-tools {
  display: flex;
  align-items: center;
  gap: var(--et-space-8);
  flex-shrink: 0;
}

.pdf-preview-tool-btn {
  min-width: 64px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.08);
  color: #f5f7fa;
}

.pdf-preview-tool-action {
  min-width: 64px;
}

.pdf-preview-body {
  height: 100%;
  overflow: hidden;
  padding: 24px;
  background: #232427;
}

.pdf-preview-iframe {
  width: 80%;
  height: 100%;
  margin: 0 auto;
  border: none;
  border-radius: 8px;
  background: #2f3136;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.32);
}

.pdf-preview-empty {
  width: min(820px, 100%);
  margin: 18px auto 0;
  padding: 24px;
  border-radius: 8px;
  background: #2f3136;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.24);
  color: #f5f7fa;
  text-align: center;
}

.pdf-preview-empty-text {
  font-size: 14px;
  font-weight: 600;
}
</style>

<style lang="scss">
.pdf-preview-drawer {
  .el-drawer {
    background: #232427;
  }

  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 24px;
    background: #2b2d31;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .el-drawer__body {
    padding: 0;
  }
}
</style>
