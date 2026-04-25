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
        <div class="pdf-preview-header-main">
          <div class="pdf-preview-title">{{ title }}</div>
          <div v-if="subtitle" class="pdf-preview-subtitle">{{ subtitle }}</div>
        </div>
        <div class="pdf-preview-tools">
          <template v-if="showPageNavigation">
            <el-button
              text
              bg
              class="pdf-tool-btn"
              @click="prevPdfPage"
              :disabled="pdfCurrentPage <= 1 || pdfLoading"
            >
              <
            </el-button>
            <span class="pdf-page-text">{{ pdfCurrentPage }} / {{ pdfPageCount || 1 }}</span>
            <el-button
              text
              bg
              class="pdf-tool-btn"
              @click="nextPdfPage"
              :disabled="pdfCurrentPage >= pdfPageCount || pdfLoading"
            >
              >
            </el-button>
            <el-divider direction="vertical" />
          </template>
          <template v-if="showZoomTools">
            <el-button
              text
              bg
              class="pdf-tool-btn"
              @click="zoomOutPdf"
              :disabled="pdfScale <= minPdfScale"
            >
              -
            </el-button>
            <span class="pdf-scale-text">{{ Math.round(pdfScale * 100) }}%</span>
            <el-button
              text
              bg
              class="pdf-tool-btn"
              @click="zoomInPdf"
              :disabled="pdfScale >= maxPdfScale"
            >
              +
            </el-button>
          </template>
          <el-divider v-if="showActionDivider" direction="vertical" />
          <el-button
            v-if="showDownload"
            text
            bg
            class="pdf-tool-btn pdf-tool-action"
            @click="downloadPdfPreview"
            :disabled="!source"
          >
            下载
          </el-button>
          <el-button
            v-if="showPrint"
            text
            bg
            class="pdf-tool-btn pdf-tool-action"
            @click="printPdfPreview"
            :disabled="!source"
          >
            打印
          </el-button>
        </div>
      </div>
    </template>
    <div class="pdf-preview-body">
      <div class="pdf-preview-layout">
        <aside v-if="showThumbnailSidebar" class="pdf-thumbnail-sidebar">
          <div class="pdf-thumbnail-toolbar">{{ thumbnailTitle }}</div>
          <div class="pdf-thumbnail-list">
            <button
              v-for="page in pdfPages"
              :key="page"
              type="button"
              class="pdf-thumbnail-item"
              :class="{ 'is-active': page === pdfCurrentPage }"
              @click="selectPdfPage(page)"
            >
              <div class="pdf-thumbnail-canvas-wrap">
                <VuePdfEmbed
                  v-if="source"
                  class="pdf-thumbnail-viewer"
                  :source="source"
                  :page="page"
                  :scale="thumbnailScale"
                />
              </div>
              <div class="pdf-thumbnail-index">{{ page }}</div>
            </button>
          </div>
        </aside>
        <div class="pdf-preview-stage">
          <VuePdfEmbed
            v-if="source"
            ref="pdfPreviewRef"
            class="pdf-preview-viewer"
            :source="source"
            :scale="pdfScale"
            :page="pdfCurrentPage"
            text-layer
            annotation-layer
            @loaded="handlePdfLoaded"
            @loading-failed="handlePdfLoadFailed"
          />
          <div v-if="showEmptyState" class="pdf-state-panel">
            <div class="pdf-state-title">{{ emptyText }}</div>
          </div>
          <div v-if="showErrorState" class="pdf-state-panel is-error">
            <div class="pdf-state-title">{{ errorText }}</div>
          </div>
          <div v-if="pdfLoading" class="pdf-loading-mask">
            <div class="pdf-state-panel is-loading">
              <div class="pdf-state-title">{{ loadingText }}</div>
              <el-skeleton animated :rows="10" class="pdf-loading-skeleton" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import VuePdfEmbed, { GlobalWorkerOptions } from "vue-pdf-embed/dist/index.essential.mjs";
import "vue-pdf-embed/dist/styles/annotationLayer.css";
import "vue-pdf-embed/dist/styles/textLayer.css";

GlobalWorkerOptions.workerSrc = new URL(/* @vite-ignore */ "pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url).toString();

defineOptions({
  name: "PdfPreview",
});

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    subtitle?: string;
    source?: string;
    drawerSize?: string;
    showPageNavigation?: boolean;
    showZoomTools?: boolean;
    showDownload?: boolean;
    showPrint?: boolean;
    showThumbnailSidebar?: boolean;
    thumbnailTitle?: string;
    loadingText?: string;
    emptyText?: string;
    errorText?: string;
  }>(),
  {
    title: "",
    subtitle: "Custom print preview",
    source: "",
    drawerSize: "92%",
    showPageNavigation: true,
    showZoomTools: true,
    showDownload: true,
    showPrint: true,
    showThumbnailSidebar: true,
    thumbnailTitle: "Pages",
    loadingText: "Loading preview...",
    emptyText: "No PDF source available",
    errorText: "Failed to load PDF preview",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const pdfPreviewRef = ref<any>(null);
const pdfScale = ref(1);
const minPdfScale = 0.6;
const maxPdfScale = 2;
const pdfLoading = ref(false);
const pdfPageCount = ref(0);
const pdfCurrentPage = ref(1);
const pdfLoadError = ref(false);
const thumbnailScale = 0.22;

const showActionDivider = computed(() => {
  return (
    (props.showPageNavigation || props.showZoomTools) && (props.showDownload || props.showPrint)
  );
});

const pdfPages = computed(() => {
  return Array.from({ length: pdfPageCount.value }, (_, index) => index + 1);
});

const showEmptyState = computed(() => {
  return !props.source && !pdfLoading && !pdfLoadError.value;
});

const showErrorState = computed(() => {
  return pdfLoadError.value && !pdfLoading;
});

const resetPreviewState = () => {
  pdfScale.value = 1;
  pdfLoading.value = !!props.source;
  pdfPageCount.value = 0;
  pdfCurrentPage.value = 1;
  pdfLoadError.value = false;
};

const downloadPdfPreview = () => {
  if (pdfPreviewRef.value?.download) {
    pdfPreviewRef.value.download(props.title || "custom-print-preview.pdf");
    return;
  }

  if (!props.source) return;
  const link = document.createElement("a");
  link.href = props.source;
  link.download = props.title || "custom-print-preview.pdf";
  link.click();
};

const printPdfPreview = () => {
  if (pdfPreviewRef.value?.print) {
    pdfPreviewRef.value.print(150, props.title || "custom-print-preview.pdf", true);
    return;
  }

  if (!props.source) return;
  window.open(props.source, "_blank");
};

const zoomInPdf = () => {
  pdfScale.value = Math.min(maxPdfScale, Number((pdfScale.value + 0.1).toFixed(1)));
};

const zoomOutPdf = () => {
  pdfScale.value = Math.max(minPdfScale, Number((pdfScale.value - 0.1).toFixed(1)));
};

const prevPdfPage = () => {
  pdfCurrentPage.value = Math.max(1, pdfCurrentPage.value - 1);
};

const nextPdfPage = () => {
  pdfCurrentPage.value = Math.min(pdfPageCount.value, pdfCurrentPage.value + 1);
};

const selectPdfPage = (page: number) => {
  pdfCurrentPage.value = page;
};

const handlePdfLoaded = (doc: { numPages: number }) => {
  pdfPageCount.value = doc.numPages;
  pdfCurrentPage.value = Math.min(pdfCurrentPage.value, doc.numPages || 1);
  pdfLoading.value = false;
  pdfLoadError.value = false;
};

const handlePdfLoadFailed = () => {
  pdfLoading.value = false;
  pdfLoadError.value = true;
  ElMessage.error(props.errorText);
};

watch(
  () => [props.modelValue, props.source],
  ([visible, source]) => {
    if (visible && source) {
      resetPreviewState();
      return;
    }

    if (!visible) {
      pdfPreviewRef.value = null;
      pdfLoading.value = false;
      pdfLoadError.value = false;
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.pdf-preview-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--et-space-12);
}

.pdf-preview-header-main {
  min-width: 0;
}

.pdf-preview-title {
  font-weight: 600;
  color: #f5f7fa;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pdf-preview-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}

.pdf-preview-tools {
  display: flex;
  align-items: center;
  gap: var(--et-space-8);
  flex-shrink: 0;
}

.pdf-scale-text {
  min-width: 52px;
  text-align: center;
  color: #f5f7fa;
  font-size: 13px;
}

.pdf-page-text {
  min-width: 64px;
  text-align: center;
  color: #f5f7fa;
  font-size: 13px;
}

.pdf-tool-btn {
  min-width: 36px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.08);
  color: #f5f7fa;
}

.pdf-tool-action {
  min-width: 64px;
}

.pdf-preview-body {
  height: 100%;
  overflow: hidden;
  padding: 24px;
  background: #232427;
}

.pdf-preview-layout {
  height: 100%;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 20px;
}

.pdf-thumbnail-sidebar {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding-right: 16px;
}

.pdf-thumbnail-toolbar {
  padding: 8px 4px 16px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.pdf-thumbnail-list {
  overflow: auto;
  padding-right: 6px;
}

.pdf-thumbnail-item {
  width: 100%;
  margin-bottom: 16px;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.pdf-thumbnail-canvas-wrap {
  display: flex;
  justify-content: center;
  padding: 12px;
  border-radius: 8px;
  background: #2f3136;
  border: 1px solid transparent;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
}

.pdf-thumbnail-item:hover .pdf-thumbnail-canvas-wrap,
.pdf-thumbnail-item.is-active .pdf-thumbnail-canvas-wrap {
  border-color: #7aa2ff;
  transform: translateY(-1px);
}

.pdf-thumbnail-index {
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
}

.pdf-thumbnail-viewer {
  pointer-events: none;
}

:deep(.pdf-thumbnail-viewer .vue-pdf-embed__page) {
  margin-bottom: 0;
  box-shadow: none;
}

.pdf-preview-stage {
  min-height: 100%;
  display: flex;
  position: relative;
  overflow: auto;
  justify-content: center;
  padding: 8px 0 24px;
}

.pdf-preview-viewer {
  width: fit-content;
  margin: 0 auto;
  padding: 18px;
  border-radius: 8px;
  background: #2f3136;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.32);
}

:deep(.pdf-preview-drawer .el-drawer) {
  background: #232427;
}

:deep(.pdf-preview-drawer .el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 24px;
  background: #2b2d31;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

:deep(.pdf-preview-drawer .el-drawer__body) {
  padding: 0;
}

:deep(.pdf-preview-drawer .el-divider--vertical) {
  margin: 0 4px;
  border-color: rgba(255, 255, 255, 0.16);
}

:deep(.pdf-preview-viewer .vue-pdf-embed__page) {
  margin-bottom: 16px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.24);
}

.pdf-loading-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 18px;
  background: rgba(35, 36, 39, 0.78);
}

.pdf-loading-skeleton {
  margin-top: 16px;
  width: min(820px, 100%);
}

.pdf-state-panel {
  width: min(820px, 100%);
  margin-top: 18px;
  padding: 24px;
  border-radius: 8px;
  background: #2f3136;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.24);
  color: #f5f7fa;
}

.pdf-state-panel.is-loading {
  background: var(--et-bg-container);
  color: var(--et-text-primary);
}

.pdf-state-panel.is-error {
  border: 1px solid rgba(245, 108, 108, 0.45);
}

.pdf-state-title {
  font-size: 14px;
  font-weight: 600;
}

@media (max-width: 960px) {
  .pdf-preview-layout {
    grid-template-columns: 1fr;
  }

  .pdf-thumbnail-sidebar {
    display: none;
  }
}
</style>
