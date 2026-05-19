<template>
  <div v-if="profile" class="appstore-detail">
    <div class="detail-header" :style="heroStyle">
      <div class="detail-title-row">
        <router-link class="back-link" to="/appstore">
          <et-icon icon="el-ArrowLeft" size="18" />
        </router-link>
        <img v-if="profile.icon" :src="profile.icon" class="profile-icon" :alt="profile.name" />
        <div>
          <div class="detail-title">{{ profile.name }}</div>
          <div class="detail-subtitle">{{ profile.summary }}</div>
        </div>
      </div>
      <el-button type="success" size="large" @click="install">安装模板</el-button>
    </div>

    <div class="detail-main">
      <div class="gallery-panel">
        <img class="hero-image" :src="activeImage" :alt="profile.name" />
        <div class="thumb-row">
          <button v-for="image in galleryImages" :key="image" class="thumb" :class="{ active: image === activeImage }" @click="activeImage = image">
            <img :src="image" :alt="profile.name" />
          </button>
        </div>
      </div>

      <aside class="meta-panel">
        <div class="meta-block">
          <div class="meta-label">作者</div>
          <div class="meta-value">{{ profile.author || 'EIMSNext' }}</div>
        </div>
        <div class="meta-block">
          <div class="meta-label">安装量</div>
          <div class="meta-value">{{ profile.installCount || 0 }}</div>
        </div>
        <div class="meta-block">
          <div class="meta-label">标签</div>
          <div class="meta-tags">
            <span v-for="tag in profile.tags || []" :key="tag" class="meta-tag">{{ tag }}</span>
          </div>
        </div>
      </aside>
    </div>

    <div class="content-panel">
      <h2>模板介绍</h2>
      <p>{{ profile.description || profile.summary }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AppProfile } from "@eimsnext/models";
import { appProfileService } from "@eimsnext/services";
import { useAppDefStore, useContextStore } from "@eimsnext/store";
import { accessToken } from "@eimsnext/utils";
import { useRoute, useRouter } from "vue-router";

defineOptions({ name: "AppStoreDetailPage" });

const route = useRoute();
const router = useRouter();
const appDefStore = useAppDefStore();
const contextStore = useContextStore();
const profile = ref<AppProfile>();
const activeImage = ref("");

const galleryImages = computed(() => {
  const item = profile.value;
  if (!item) return [];
  const images = [item.coverImage, item.bannerImage, ...(item.galleryImages || [])].filter(Boolean) as string[];
  return Array.from(new Set(images));
});

const heroStyle = computed(() => ({
  background: profile.value?.themeColor ? `linear-gradient(135deg, ${profile.value.themeColor}22, ${profile.value.themeColor}66)` : undefined,
}));

async function loadDetail() {
  const id = route.params.id as string;
  profile.value = await appProfileService.get(id);
  activeImage.value = galleryImages.value[0] || "";
}

async function install() {
  const id = route.params.id as string;
  if (!accessToken.isLoggedIn()) {
    router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
    return;
  }

  const result = await appProfileService.install(id);
  await appDefStore.load("", false);
  await contextStore.setAppId(result.appId, false);
  router.push("/workspace");
}

onMounted(loadDetail);
</script>

<style scoped lang="scss">
.appstore-detail {
  min-height: 100vh;
  padding: 24px 32px 32px;
  background: var(--et-bg-page);
}

.detail-header,
.detail-main,
.content-panel {
  border-radius: 24px;
  border: 1px solid var(--et-border-color-light);
  background: var(--et-bg-container);
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 28px;
}

.detail-title-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-link {
  color: var(--et-text-primary);
}

.profile-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
}

.detail-title {
  font-size: 28px;
  font-weight: 700;
}

.detail-subtitle {
  margin-top: 8px;
  color: var(--et-text-secondary);
}

.detail-main {
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  padding: 24px;
}

.hero-image {
  width: 100%;
  border-radius: 20px;
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
  border-radius: 14px;
  background: transparent;
  padding: 4px;
  cursor: pointer;
}

.thumb.active {
  border-color: var(--et-color-primary);
}

.thumb img {
  width: 140px;
  height: 88px;
  object-fit: cover;
  border-radius: 10px;
}

.meta-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.meta-block {
  padding: 18px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--et-bg-container) 80%, var(--et-color-primary) 20%);
}

.meta-label {
  color: var(--et-text-secondary);
  margin-bottom: 10px;
}

.meta-value {
  font-size: 20px;
  font-weight: 700;
}

.meta-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-tag {
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--et-fill-color-light);
}

.content-panel {
  margin-top: 24px;
  padding: 28px;
}

@media (max-width: 960px) {
  .appstore-detail {
    padding: 16px;
  }

  .detail-header,
  .detail-main {
    grid-template-columns: 1fr;
    display: grid;
  }
}
</style>
