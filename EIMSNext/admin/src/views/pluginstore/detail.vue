<template>
  <div v-if="profile" class="pluginstore-detail">
    <section class="detail-hero">
      <div class="detail-hero-main">
        <router-link class="back-link" to="/open-platform/pluginstore">
          <et-icon icon="el-ArrowLeft" size="16" />
          <span>返回列表</span>
        </router-link>

        <div class="title-row">
          <img v-if="profile.icon" :src="profile.icon" class="profile-icon" :alt="profile.name" />
          <div class="title-copy">
            <div class="title-topline">
              <h1 class="detail-title">{{ profile.name }}</h1>
              <span v-if="profile.isOfficial" class="status-badge official">官方</span>
              <span v-else-if="profile.isHot" class="status-badge hot">热门</span>
              <span v-if="profile.installed" class="status-badge installed">已安装</span>
            </div>
            <div class="detail-subtitle">{{ profile.summary }}</div>
            <div class="detail-tags">
              <span v-for="tag in profile.tags || []" :key="tag" class="detail-tag">{{ tag }}</span>
            </div>
            <div class="detail-install-meta">安装量 {{ profile.installCount || 0 }}</div>
          </div>
        </div>
      </div>

      <div class="detail-hero-side">
        <div class="hero-side-title">快速操作</div>
        <div class="hero-side-text">查看帮助文档、安装插件，并在已安装插件中统一管理启停状态。</div>
        <div class="action-row">
          <el-button v-if="profile.helpDocUrl" plain @click="openLink(profile.helpDocUrl)">使用说明</el-button>
          <el-button type="primary" size="large" @click="install">{{ profile.installed ? "重新安装" : "安装插件" }}</el-button>
        </div>
      </div>
    </section>

    <section class="detail-body">
      <div class="detail-main-card">
        <div class="visual-panel">
          <img v-if="activeImage" class="hero-image" :src="activeImage" :alt="profile.name" />
          <div v-else class="hero-image placeholder">{{ profile.name }}</div>
          <div v-if="galleryImages.length > 1" class="thumb-row">
            <button v-for="image in galleryImages" :key="image" class="thumb" :class="{ active: image === activeImage }" @click="activeImage = image">
              <img :src="image" :alt="profile.name" />
            </button>
          </div>
        </div>

        <div class="content-panel">
          <div class="panel-head">
            <div class="panel-title with-bar">插件介绍</div>
          </div>
          <p class="panel-text">{{ profile.description || profile.summary }}</p>
        </div>

        <div class="content-panel">
          <div class="panel-head">
            <div class="panel-title with-bar">插件函数</div>
            <div class="panel-meta">{{ (profile.functions || []).length }} 个函数</div>
          </div>

          <div v-if="profile.functions?.length" class="function-grid">
            <div v-for="fn in profile.functions" :key="fn.id || fn.name" class="function-card">
              <div class="function-name">{{ fn.name }}</div>
              <div class="function-desc">{{ fn.description || '暂无说明' }}</div>
              <div class="function-fields">
                <span v-for="field in fn.inputFields || []" :key="field.key" class="function-field-tag">
                  {{ field.name }}
                </span>
                <span v-if="!(fn.inputFields || []).length" class="function-field-tag muted">无输入字段</span>
              </div>
            </div>
          </div>

          <el-empty v-else description="暂无函数清单" />
        </div>
      </div>

      <aside class="detail-aside">
        <div class="meta-card">
          <div class="meta-label">工具类型</div>
          <div class="meta-value">{{ profile.category || '-' }}</div>
        </div>
        <div class="meta-card">
          <div class="meta-label">业务场景</div>
          <div class="meta-value">{{ profile.scenario || '-' }}</div>
        </div>
        <div class="meta-card">
          <div class="meta-label">开发者</div>
          <div class="meta-value">{{ profile.developerName || 'EIMSNext' }}</div>
        </div>
        <div class="meta-card">
          <div class="meta-label">版本</div>
          <div class="meta-value">{{ profile.version }}</div>
        </div>
        <div class="meta-card">
          <div class="meta-label">安装量</div>
          <div class="meta-value">{{ profile.installCount || 0 }}</div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { PluginProfile } from "@eimsnext/models";
import { pluginStoreService } from "@eimsnext/services";
import { useRoute } from "vue-router";

defineOptions({ name: "PluginStoreDetailPage" });

const route = useRoute();
const profile = ref<PluginProfile>();
const activeImage = ref("");

const galleryImages = computed(() => {
  const item = profile.value;
  if (!item) return [];
  const images = [item.coverImage, item.bannerImage, ...(item.galleryImages || [])].filter(Boolean) as string[];
  return Array.from(new Set(images));
});

async function loadDetail() {
  const id = route.params.id as string;
  profile.value = await pluginStoreService.get(id);
  activeImage.value = galleryImages.value[0] || "";
}

async function install() {
  const id = route.params.id as string;
  await pluginStoreService.install(id);
  await loadDetail();
}

function openLink(url?: string) {
  if (!url) return;
  window.open(url, "_blank");
}

onMounted(loadDetail);
</script>

<style scoped lang="scss">
.pluginstore-detail {
  min-height: 100%;
  padding: 24px;
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--et-color-primary) 16%, transparent) 0, transparent 32%),
    linear-gradient(180deg, var(--et-bg-page) 0%, color-mix(in srgb, var(--et-bg-page) 72%, var(--et-bg-container) 28%) 100%);
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
  background: linear-gradient(135deg, color-mix(in srgb, var(--et-bg-container) 80%, #dbeafe 20%), color-mix(in srgb, var(--et-bg-container) 84%, #eff6ff 16%));
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--et-text-primary);
  text-decoration: none;
  font-size: 14px;
}

.title-row {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  margin-top: 18px;
}

.profile-icon {
  width: 68px;
  height: 68px;
  border-radius: 20px;
  object-fit: cover;
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.12);
}

.title-copy {
  min-width: 0;
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

.status-badge.official { background: #2563eb; color: #fff; }
.status-badge.hot { background: #f97316; color: #fff; }
.status-badge.installed { background: #0f766e; color: #fff; }

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

.detail-install-meta {
  margin-top: 14px;
  color: var(--et-text-tertiary);
  font-size: 13px;
}

.detail-hero-side {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--et-bg-container) 92%, transparent);
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
  border-radius: 18px;
  background: color-mix(in srgb, var(--et-bg-container) 98%, transparent);
}

.hero-image {
  width: 100%;
  aspect-ratio: 16 / 8.4;
  border-radius: 24px;
  object-fit: cover;
  border: 1px solid var(--et-border-color-light);
}

.hero-image.placeholder {
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #bfdbfe, #dbeafe);
  color: #1e3a8a;
  font-size: 32px;
  font-weight: 700;
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

.content-panel + .content-panel {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid color-mix(in srgb, var(--et-border-color-light) 72%, transparent);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
}

.panel-title.with-bar {
  position: relative;
  padding-left: 12px;
}

.panel-title.with-bar::before {
  content: "";
  position: absolute;
  left: 0;
  top: 3px;
  bottom: 3px;
  width: 4px;
  border-radius: 999px;
  background: linear-gradient(180deg, #14b8a6, #0ea5e9);
}

.panel-meta,
.panel-text {
  color: var(--et-text-secondary);
}

.panel-text {
  line-height: 1.8;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.function-card {
  padding: 16px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--et-fill-color-light) 58%, transparent);
  border: 1px solid color-mix(in srgb, var(--et-border-color-light) 78%, transparent);
}

.function-name {
  font-size: 16px;
  font-weight: 700;
}

.function-desc {
  min-height: 48px;
  margin-top: 10px;
  color: var(--et-text-secondary);
  line-height: 1.7;
}

.function-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.function-field-tag {
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--et-bg-container) 82%, transparent);
  font-size: 12px;
}

.function-field-tag.muted {
  color: var(--et-text-tertiary);
}

.detail-aside {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.meta-card {
  padding: 18px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--et-bg-container) 96%, transparent);
}

.meta-label {
  color: var(--et-text-secondary);
  margin-bottom: 10px;
}

.meta-value {
  font-size: 18px;
  font-weight: 700;
}

:global(html.dark) .pluginstore-detail {
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.18) 0, transparent 32%),
    linear-gradient(180deg, #09111f 0%, #0b1424 100%);
}

:global(html.dark) .detail-hero,
:global(html.dark) .detail-main-card,
:global(html.dark) .meta-card {
  box-shadow: 0 24px 54px rgba(2, 6, 23, 0.42);
}

:global(html.dark) .detail-hero {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(20, 35, 64, 0.92));
}

:global(html.dark) .detail-hero-side,
:global(html.dark) .detail-main-card,
:global(html.dark) .meta-card,
:global(html.dark) .function-card {
  background: rgba(15, 23, 42, 0.82);
}

:global(html.dark) .hero-image.placeholder {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(30, 64, 175, 0.65));
  color: #dbeafe;
}

@media (max-width: 1100px) {
  .detail-hero,
  .detail-body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .pluginstore-detail {
    padding: 16px;
  }

  .detail-title {
    font-size: 26px;
  }

  .detail-hero,
  .detail-main-card {
    padding: 18px;
  }
}
</style>
