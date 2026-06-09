<template>
  <el-drawer :model-value="modelValue" :size="drawerSize" direction="btt" destroy-on-close :show-close="false"
    :with-header="false" class="pdf-preview-drawer" @update:model-value="emit('update:modelValue', $event)">
    <div class="pdf-preview-header">
      <div class="pdf-preview-title">{{ title }}</div>
      <el-button text class="pdf-preview-tool-btn" @click="handleDownload" :disabled="!pdfUrl">
        <et-icon icon="el-download" size="18px" />
        <span style="margin-left: 4px;">{{ t("admin.pdfPreview.download") }}</span>
      </el-button>
      <el-button text class="pdf-preview-close" :aria-label="t('admin.pdfPreview.closePreview')" @click="handleClose">
        <et-icon icon="el-close" size="24px" />
      </el-button>
    </div>
    <div class="pdf-preview-body">
      <div class="preview-center">
        <iframe v-if="pdfUrl" :src="pdfUrl" class="pdf-preview-iframe" />
        <div v-else class="pdf-preview-empty">
          <div class="pdf-preview-empty-text">{{ emptyText }}</div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();

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
const emptyText = t("admin.pdfPreview.empty");

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
    console.error(t("admin.pdfPreview.downloadFailed"), error);
  }
};
</script>

<style lang="scss" scoped>
.pdf-preview-header {
  background: rgba(0, 0, 0, .6);
  color: #fff;
  height: 50px;
  line-height: 50px;
  position: relative;
}

.pdf-preview-title {
  bottom: 0;
  display: inline-block;
  left: 30px;
  overflow: hidden;
  position: absolute;
  right: 200px;
  text-overflow: ellipsis;
  top: 0;
  white-space: nowrap;
}

.pdf-preview-tool-btn {
  color: inherit;
  display: block;
  font-size: 15px;
  height: 50px;
  outline: none;
  padding: 0 10px;
  position: absolute;
  right: 60px;
  text-decoration: none;
  top: 0;
  transition: all .2s ease;

  &:hover {
    background-color: #000 !important;
  }
}

.pdf-preview-close {
  cursor: pointer;
  font-size: 20px;
  height: 50px;
  position: absolute;
  right: 10px;
  text-align: center;
  top: 0;
  transition: all .2s ease;
  width: 50px;
  color: #fff;

  &:hover {
    background-color: #000 !important;
  }
}


.pdf-preview-body {
  bottom: 0;
  left: 0;
  overflow: hidden;
  position: absolute;
  right: 0;
  top: 50px;
  background: #2f3136;

  .preview-center {
    bottom: 0;
    left: 0;
    margin: auto;
    max-height: 100%;
    max-width: 80%;
    position: absolute;
    right: 0;
    top: 0;
  }
}

.pdf-preview-iframe {
  width: 100%;
  height: 100%;
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
