<template>
  <div class="image-settings no-drag">
    <div class="section-title-row">
      <span class="section-title">{{ t('admin.dashboardDesigner.image') }}</span>
      <span class="section-tip">{{ t('admin.dashboardDesigner.imageTip') }}</span>
      <span class="image-count">{{ images.length }}/{{ DASHBOARD_IMAGE_LIMIT }}</span>
    </div>
    <div class="image-list">
      <div v-for="image in images" :key="image.url" class="image-thumb">
        <img :src="getFileFullUrl(image.thumbUrl || image.url)" :alt="image.name" />
        <el-button link class="delete-image delete-button" :title="t('common.delete')" @click="removeImage(image.url)"><et-icon icon="el-delete" /></el-button>
      </div>
      <el-upload
        v-if="images.length < DASHBOARD_IMAGE_LIMIT"
        class="image-upload"
        :accept="DASHBOARD_IMAGE_ACCEPT"
        :show-file-list="false"
        :before-upload="validateFile"
        :http-request="uploadImage"
      >
        <et-icon icon="el-plus" />
      </el-upload>
    </div>
    <div class="setting-section">
      <div class="section-title">{{ t('admin.dashboardDesigner.imageFit') }}</div>
      <el-radio-group v-model="fit" @change="emitUpdated">
        <el-radio value="contain">{{ t('admin.dashboardDesigner.imageFitContain') }}</el-radio>
        <el-radio value="cover">{{ t('admin.dashboardDesigner.imageFitCover') }}</el-radio>
        <el-radio value="fill">{{ t('admin.dashboardDesigner.imageFitFill') }}</el-radio>
      </el-radio-group>
    </div>
    <div class="autoplay-row">
      <span class="section-title">{{ t('admin.dashboardDesigner.imageAutoPlay') }}</span>
      <el-switch v-model="autoPlay" :disabled="images.length < 2" @change="emitUpdated" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage, type UploadRequestOptions, type UploadRawFile } from "element-plus";
import { useI18n } from "vue-i18n";
import { getFileFullUrl, http } from "@eimsnext/utils";
import {
  DASHBOARD_IMAGE_ACCEPT,
  DASHBOARD_IMAGE_LIMIT,
  DASHBOARD_IMAGE_MAX_SIZE,
  IDashboardImage,
  IDashboardImageSetting,
  DashboardImageFit,
} from "./type";

const props = defineProps<{ modelValue: IDashboardImageSetting }>();
const emit = defineEmits<{ updated: [setting: IDashboardImageSetting] }>();
const { t } = useI18n();
const images = ref<IDashboardImage[]>([...props.modelValue.images]);
const fit = ref<DashboardImageFit>(props.modelValue.fit);
const autoPlay = ref(props.modelValue.autoPlay);

watch(() => props.modelValue, (setting) => {
  images.value = [...setting.images];
  fit.value = setting.fit;
  autoPlay.value = setting.autoPlay;
}, { deep: true });

const emitUpdated = () => {
  if (images.value.length < 2) autoPlay.value = false;
  emit("updated", { version: 1, kind: "image", images: [...images.value], fit: fit.value, autoPlay: autoPlay.value });
};

const validateFile = (file: UploadRawFile) => {
  const isImage = ["image/jpeg", "image/png", "image/gif"].includes(file.type) || /\.(jpe?g|png|gif)$/i.test(file.name);
  if (!isImage) {
    ElMessage.error(t("admin.dashboardDesigner.imageTypeError"));
    return false;
  }
  if (file.size > DASHBOARD_IMAGE_MAX_SIZE) {
    ElMessage.error(t("admin.dashboardDesigner.imageSizeError"));
    return false;
  }
  if (images.value.length >= DASHBOARD_IMAGE_LIMIT) {
    ElMessage.error(t("admin.dashboardDesigner.imageLimitError", { limit: DASHBOARD_IMAGE_LIMIT }));
    return false;
  }
  return true;
};

const uploadImage = async (option: UploadRequestOptions) => {
  const formData = new FormData();
  formData.append("uploadType", "image");
  formData.append("file", option.file);
  try {
    const result = await http.upload.upload("/upload", formData, option.onProgress, true);
    const uploaded = result?.value?.[0] || result?.data?.[0];
    const url = uploaded?.savePath || uploaded?.url;
    if (!url) throw new Error("Missing uploaded file URL");
    images.value.push({ id: uploaded.id, name: uploaded.fileName || uploaded.name || option.file.name, url, thumbUrl: uploaded.thumbPath || uploaded.thumbUrl });
    emitUpdated();
    option.onSuccess?.(result);
  } catch (error) {
    ElMessage.error(t("admin.dashboardDesigner.imageUploadFailed"));
    option.onError?.(error as any);
  }
};

const removeImage = (url: string) => {
  images.value = images.value.filter((image) => image.url !== url);
  emitUpdated();
};
</script>

<style scoped lang="scss">
.image-settings { width: 320px; }
.section-title-row { display: flex; align-items: baseline; gap: var(--et-space-8); }.section-title { font-weight: 600; color: var(--et-text-primary); }.section-tip { flex: 1; color: var(--et-text-secondary); font-size: var(--et-font-size-12); }.image-count { color: var(--et-color-primary); font-size: var(--et-font-size-12); }.image-list { display: flex; flex-wrap: wrap; gap: var(--et-space-8); margin-top: var(--et-space-10); }.image-thumb, .image-upload { position: relative; display: flex; align-items: center; justify-content: center; width: 84px; height: 64px; border: 1px solid var(--et-border-color); border-radius: var(--et-radius-3); overflow: hidden; }.image-thumb img { width: 100%; height: 100%; object-fit: cover; }.image-upload { color: var(--et-color-primary); cursor: pointer; border-style: dashed; }.delete-image { position: absolute; top: 0; right: 0; width: 24px; height: 24px; color: #fff; background: rgba(0, 0, 0, .5); }.setting-section { margin-top: var(--et-space-16); }.setting-section :deep(.el-radio) { margin-top: var(--et-space-8); margin-right: var(--et-space-12); }.autoplay-row { display: flex; align-items: center; justify-content: space-between; margin-top: var(--et-space-16); }
</style>
