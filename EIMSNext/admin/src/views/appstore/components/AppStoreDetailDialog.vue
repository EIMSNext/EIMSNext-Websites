<template>
  <et-dialog :model-value="modelValue" :title="$t('admin.appStore.appDetail')" :show-footer="false" width="60%" @close="close">
    <div v-loading="loading">
      <div v-if="profile" class="appstore-detail">
      <section class="detail-hero">
        <div class="detail-hero-main">
          <div class="title-row">
            <img v-if="profile.icon" :src="profile.icon" class="profile-icon" :alt="profile.name" />
            <div class="title-copy">
              <div class="title-topline">
                <h1 class="detail-title">{{ profile.name }}</h1>
                <span v-if="profile.isOfficial" class="status-badge official">{{ $t("admin.official") }}</span>
                <span v-else-if="profile.isHot" class="status-badge hot">{{ $t("admin.hot") }}</span>
              </div>
              <div class="detail-subtitle">{{ profile.summary }}</div>
              <div class="detail-tags">
                <span v-for="tag in profile.tags || []" :key="tag" class="detail-tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-hero-side">
          <div class="hero-side-title">{{ $t("admin.appStore.installTemplate") }}</div>
          <div class="hero-side-text">{{ $t("admin.appStore.installDesc") }}</div>
          <div class="action-row">
            <el-button type="success" size="large" :loading="installing" @click="install">{{ $t("admin.appStore.installTemplate") }}</el-button>
          </div>
        </div>
      </section>

      <section class="detail-body">
        <div class="detail-main-card">
          <div class="visual-panel">
            <img v-if="activeImage" class="hero-image" :src="activeImage" :alt="profile.name" />
            <div v-if="galleryImages.length > 1" class="thumb-row">
              <button v-for="image in galleryImages" :key="image" class="thumb" :class="{ active: image === activeImage }" @click="activeImage = image">
                <img :src="image" :alt="profile.name" />
              </button>
            </div>
          </div>

          <div class="content-panel">
            <div class="panel-title">{{ $t("admin.appStore.templateIntro") }}</div>
            <p class="panel-text">{{ profile.description || profile.summary }}</p>
          </div>
        </div>

        <aside class="detail-aside">
          <div class="meta-card">
            <div class="meta-label">{{ $t("admin.appStore.author") }}</div>
            <div class="meta-value">{{ profile.author || 'EIMSNext' }}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">{{ $t("admin.installCount") }}</div>
            <div class="meta-value">{{ profile.installCount || 0 }}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">{{ $t("admin.appStore.category") }}</div>
            <div class="meta-value">{{ profile.category || '-' }}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">{{ $t("admin.appStore.industry") }}</div>
            <div class="meta-value">{{ profile.industry || '-' }}</div>
          </div>
        </aside>
      </section>
      </div>
      <el-result v-else-if="loadError" icon="error" :title="$t('admin.appStore.detailLoadFailed')">
        <template #extra>
          <el-button type="primary" @click="loadDetail">{{ $t("admin.appStore.retry") }}</el-button>
        </template>
      </el-result>
    </div>
  </et-dialog>
</template>

<script setup lang="ts">
import type { AppProfile } from "@eimsnext/models";
import { appProfileService } from "@eimsnext/services";
import { useAppDefStore, useContextStore } from "@eimsnext/store";
import { accessToken } from "@eimsnext/utils";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

defineOptions({ name: "AppStoreDetailDialog" });

const props = defineProps<{
  modelValue: boolean;
  appId: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "install-success"): void;
}>();

const appDefStore = useAppDefStore();
const contextStore = useContextStore();
const route = useRoute();
const router = useRouter();
const profile = ref<AppProfile>();
const activeImage = ref("");
const installing = ref(false);
const loading = ref(false);
const loadError = ref(false);
let detailRequestId = 0;

const galleryImages = computed(() => {
  const item = profile.value;
  if (!item) return [];
  const images = [item.coverImage, item.bannerImage, ...(item.galleryImages || [])].filter(Boolean) as string[];
  return Array.from(new Set(images));
});

function close() {
  detailRequestId += 1;
  profile.value = undefined;
  activeImage.value = "";
  loadError.value = false;
  loading.value = false;
  emit("update:modelValue", false);
}

async function loadDetail() {
  if (!props.appId) return;
  const requestId = ++detailRequestId;
  profile.value = undefined;
  activeImage.value = "";
  loadError.value = false;
  loading.value = true;
  try {
    const result = await appProfileService.get(props.appId);
    if (requestId !== detailRequestId) return;
    profile.value = result;
    activeImage.value = galleryImages.value[0] || "";
  } catch {
    if (requestId === detailRequestId) loadError.value = true;
  } finally {
    if (requestId === detailRequestId) loading.value = false;
  }
}

watch(() => props.modelValue, (val) => {
  if (val && props.appId) loadDetail();
});

async function install() {
  if (!props.appId) return;
  if (!accessToken.isLoggedIn()) {
    ElMessage.warning(t("admin.appStore.loginRequired"));
    close();
    await router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
    return;
  }

  installing.value = true;
  try {
    const result = await appProfileService.install(props.appId);
    await appDefStore.load("", false);
    await contextStore.setAppId(result.appId, false);
    ElMessage.success(t("admin.appStore.installSuccess"));
    emit("install-success");
    close();
  } catch {
    ElMessage.error(t("admin.appStore.installFailed"));
  } finally {
    installing.value = false;
  }
}

const { t } = useI18n();
</script>

<style scoped lang="scss">
.appstore-detail {
  padding: 0;
  color: var(--et-text-primary);
}

.detail-hero,
.detail-main-card,
.meta-card {
  border: 1px solid color-mix(in srgb, var(--et-border-color-light) 78%, transparent);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.06);
}

.detail-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) 320px;
  gap: 24px;
  padding: 28px;
  border-radius: 30px;
}

.title-row {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

.profile-icon {
  width: 68px;
  height: 68px;
  border-radius: 20px;
  object-fit: cover;
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.12);
}

.title-topline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.detail-title {
  margin: 0;
  font-size: 34px;
  line-height: 1.15;
}

.detail-subtitle {
  margin-top: 10px;
  color: var(--et-text-secondary);
  line-height: 1.7;
}

.status-badge,
.detail-tag {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
}

.status-badge.official { background: var(--et-color-primary); color: var(--et-text-on-primary); }
.status-badge.hot { background: var(--et-color-warning); color: var(--et-text-on-warning); }

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.detail-tag {
  background: color-mix(in srgb, var(--et-fill-color-light) 86%, transparent);
  color: var(--et-text-secondary);
}

.detail-hero-side {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
  border-radius: 24px;
  background: color-mix(in srgb, var(--et-bg-container) 90%, transparent);
}

.hero-side-title {
  font-size: 20px;
  font-weight: 700;
}

.hero-side-text {
  margin-top: 8px;
  color: var(--et-text-secondary);
  line-height: 1.7;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.detail-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 24px;
  margin-top: 24px;
}

.detail-main-card {
  padding: 24px;
  border-radius: 30px;
  background: color-mix(in srgb, var(--et-bg-container) 98%, transparent);
}

.hero-image {
  width: 100%;
  aspect-ratio: 16 / 8.4;
  border-radius: 24px;
  object-fit: cover;
  border: 1px solid var(--et-border-color-light);
}

.thumb-row {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  overflow-x: auto;
}

.thumb {
  border: 1px solid var(--et-border-color-light);
  border-radius: 16px;
  background: transparent;
  padding: 4px;
  cursor: pointer;
}

.thumb.active {
  border-color: var(--et-color-primary);
}

.thumb img {
  width: 132px;
  height: 84px;
  object-fit: cover;
  border-radius: 12px;
}

.content-panel {
  margin-top: 24px;
}

.panel-title {
  font-size: 24px;
  font-weight: 700;
}

.panel-text {
  margin-top: 14px;
  color: var(--et-text-secondary);
  line-height: 1.8;
}

.detail-aside {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.meta-card {
  padding: 20px;
  border-radius: 24px;
  background: color-mix(in srgb, var(--et-bg-container) 96%, transparent);
}

.meta-label {
  color: var(--et-text-secondary);
  margin-bottom: 10px;
}

.meta-value {
  font-size: 22px;
  font-weight: 700;
}

@media (max-width: 1100px) {
  .detail-hero,
  .detail-body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .detail-title {
    font-size: 26px;
  }

  .detail-hero,
  .detail-main-card {
    padding: 18px;
  }
}
</style>
