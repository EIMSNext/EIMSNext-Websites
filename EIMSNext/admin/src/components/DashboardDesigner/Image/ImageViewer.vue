<template>
  <div class="dashboard-image-viewer">
    <el-empty v-if="!setting.images.length" :description="t('admin.dashboardDesigner.noImage')" />
    <img
      v-else
      :key="currentImage.url"
      :src="getFileFullUrl(currentImage.url)"
      :alt="currentImage.name"
      :class="`fit-${setting.fit}`"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { getFileFullUrl } from "@eimsnext/utils";
import { IDashboardImageSetting } from "./type";

const props = defineProps<{ setting: IDashboardImageSetting }>();
const { t } = useI18n();
const activeIndex = ref(0);
let timer: number | undefined;

const currentImage = computed(() => props.setting.images[activeIndex.value] || props.setting.images[0]);
const clearTimer = () => {
  if (timer !== undefined) {
    window.clearInterval(timer);
    timer = undefined;
  }
};
const setupTimer = () => {
  clearTimer();
  if (!props.setting.autoPlay || props.setting.images.length < 2) return;
  timer = window.setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % props.setting.images.length;
  }, 3000);
};

watch(
  () => [props.setting.autoPlay, props.setting.images.length, props.setting.images.map((image) => image.url).join("|")],
  () => {
    if (activeIndex.value >= props.setting.images.length) activeIndex.value = 0;
    setupTimer();
  },
  { immediate: true }
);
onBeforeUnmount(clearTimer);
</script>

<style scoped lang="scss">
.dashboard-image-viewer { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; overflow: hidden; background: var(--et-bg-container); }
.dashboard-image-viewer img { width: 100%; height: 100%; }
.fit-contain { object-fit: contain; }
.fit-cover { object-fit: cover; }
.fit-fill { object-fit: fill; }
</style>
