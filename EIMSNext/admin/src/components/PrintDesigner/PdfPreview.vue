<template>
  <el-drawer :model-value="modelValue" :size="drawerSize" direction="btt" destroy-on-close :show-close="false"
    :with-header="false" class="pdf-preview-drawer"
    @update:model-value="emit('update:modelValue', $event)">
    <div class="pdf-preview-header">
      <div class="pdf-preview-title">{{ title }}</div>
      <div class="pdf-preview-tools">
        <el-button text class="pdf-preview-tool-btn pdf-preview-tool-action" @click="handleDownload" :disabled="!pdfUrl">
          <el-icon class="pdf-preview-tool-icon"><Download /></el-icon>
          <span>下载</span>
        </el-button>
        <button type="button" class="pdf-preview-close" aria-label="关闭预览" @click="handleClose">
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </div>
    <div class="pdf-preview-body">
      <iframe v-if="pdfUrl" :src="pdfUrl" class="pdf-preview-iframe" />
      <div v-else class="pdf-preview-empty">
        <div class="pdf-preview-empty-text">{{ emptyText }}</div>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { Close, Download } from "@element-plus/icons-vue";

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

const drawerSize = "100%";
const emptyText = "暂无预览内容";

const handleClose = () => {
  emit("update:modelValue", false);
};

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
  min-height: 56px;
  padding: 0 20px 0 16px;
  background: #2b2b2b;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
}

.pdf-preview-title {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  font-size: 14px;
  color: #f5f7fa;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pdf-preview-tools {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.pdf-preview-tool-btn {
  min-width: auto;
  height: 32px;
  padding: 0 10px;
  border: none;
  color: #f5f7fa;
  background: transparent;
}

.pdf-preview-tool-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.pdf-preview-tool-icon {
  font-size: 15px;
}

.pdf-preview-close {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 4px;
  color: #f5f7fa;
  background: transparent;
  cursor: pointer;
}

.pdf-preview-close:hover,
.pdf-preview-tool-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.pdf-preview-body {
  height: calc(100% - 56px);
  overflow: hidden;
  background: #232427;
  box-sizing: border-box;
}

.pdf-preview-iframe {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  border: none;
  border-radius: 8px;
  background: #2f3136;
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

  .el-drawer__body {
    padding: 0;
  }
}
</style>
