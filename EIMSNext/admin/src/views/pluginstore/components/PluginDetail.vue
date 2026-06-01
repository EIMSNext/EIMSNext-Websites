<template>
  <el-drawer class="elt-drawer" :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
    direction="btt" size="95%" @opened="onOpened">
    <template #header>
      <div class="main-title"><span>{{profile?.name}}</span></div>
    </template>
    <div class="main-content" style="overflow-y: auto;">
      <div v-if="profile" class="pluginstore-detail">
        <section class="detail-hero">
          <div class="detail-hero-main">
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
              <el-button type="primary" size="large" @click="install">{{ profile.installed ? "重新安装" : "安装插件"
              }}</el-button>
            </div>
          </div>
        </section>

        <section class="detail-body">
          <div class="detail-main-card">
            <div class="visual-panel">
              <img v-if="activeImage" class="hero-image" :src="activeImage" :alt="profile.name" />
              <div v-else class="hero-image placeholder">{{ profile.name }}</div>
              <div v-if="galleryImages.length > 1" class="thumb-row">
                <button v-for="image in galleryImages" :key="image" class="thumb"
                  :class="{ active: image === activeImage }" @click="activeImage = image">
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
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import type { PluginProfile } from "@eimsnext/models";
import { pluginProfileService } from "@eimsnext/services";
import { ElMessage } from "element-plus";

defineOptions({ name: "PluginDetail" });

const props = defineProps<{
  modelValue: boolean;
  profileId: string;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "installed"): void;
}>();

const profile = ref<PluginProfile | null>(null);
const activeImage = ref("");

const galleryImages = computed(() => {
  const item = profile.value;
  if (!item) return [];
  const images = [item.coverImage, item.bannerImage, ...(item.galleryImages || [])].filter(Boolean) as string[];
  return Array.from(new Set(images));
});

async function loadDetail() {
  profile.value = null;
  activeImage.value = "";
  try {
    const data = await pluginProfileService.get(props.profileId);
    profile.value = data;
    activeImage.value = galleryImages.value[0] || "";
  } catch {
    ElMessage.error("加载插件详情失败");
  }
}

function onOpened() {
  if (props.profileId) {
    loadDetail();
  }
}

async function install() {
  if (!profile.value) return;
  try {
    await pluginProfileService.install(profile.value.id);
    ElMessage.success("安装成功");
    profile.value.installed = true;
    emit("installed");
  } catch {
    ElMessage.error("安装失败");
  }
}

function openLink(url?: string) {
  if (!url) return;
  window.open(url, "_blank");
}
</script>
<style scoped lang="scss">
:deep(.el-drawer__body) {
  padding: 0;
  overflow: auto;
}

.pluginstore-detail {
  width: 1000px;
  min-height: 100%;
  background: color-mix(in srgb, var(--et-bg-container) 98%, transparent);
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
  padding: 24px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--et-bg-container) 92%, transparent);
}

.title-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-top: 0;
}

.profile-icon {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.10);
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
  font-size: 28px;
  line-height: 1.2;
}

.detail-subtitle {
  margin-top: 8px;
  color: var(--et-text-secondary);
  line-height: 1.6;
  font-size: 14px;
}

.status-badge,
.detail-tag {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
}

.status-badge.official {
  background: #2563eb;
  color: #fff;
}

.status-badge.hot {
  background: #f97316;
  color: #fff;
}

.status-badge.installed {
  background: #0f766e;
  color: #fff;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.detail-tag {
  background: color-mix(in srgb, var(--et-fill-color-light) 86%, transparent);
  color: var(--et-text-secondary);
}

.detail-install-meta {
  margin-top: 10px;
  color: var(--et-text-tertiary);
  font-size: 12px;
}

.detail-hero-side {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--et-bg-container) 92%, transparent);
}

.hero-side-title {
  font-size: 18px;
  font-weight: 700;
}

.hero-side-text {
  margin-top: 6px;
  color: var(--et-text-secondary);
  line-height: 1.6;
  font-size: 13px;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.detail-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 24px;
  margin-top: 24px;
}

.detail-main-card {
  padding: 20px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--et-bg-container) 98%, transparent);
}

.hero-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid var(--et-border-color-light);
}

.hero-image.placeholder {
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--et-fill-color-light) 72%, transparent);
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
  border-radius: 8px;
  background: transparent;
  padding: 3px;
  cursor: pointer;
}

.thumb.active {
  border-color: var(--et-color-primary);
}

.thumb img {
  width: 132px;
  height: 84px;
  object-fit: cover;
  border-radius: 6px;
}

.content-panel {
  margin-top: 12px;
  padding-top: 12px;
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
  font-size: 16px;
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
  background: var(--et-color-primary);
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
  padding: 14px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--et-fill-color-light) 58%, transparent);
  border: 1px solid color-mix(in srgb, var(--et-border-color-light) 78%, transparent);
}

.function-name {
  font-size: 15px;
  font-weight: 700;
}

.function-desc {
  min-height: 40px;
  margin-top: 8px;
  color: var(--et-text-secondary);
  line-height: 1.6;
  font-size: 13px;
}

.function-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.function-field-tag {
  padding: 3px 8px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--et-bg-container) 82%, transparent);
  font-size: 11px;
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
  padding: 14px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--et-bg-container) 96%, transparent);
}

.meta-label {
  color: var(--et-text-secondary);
  margin-bottom: 6px;
  font-size: 12px;
}

.meta-value {
  font-size: 16px;
  font-weight: 700;
}

:global(html.dark) .pluginstore-detail {
  background: color-mix(in srgb, var(--et-bg-container) 82%, transparent);
}

:global(html.dark) .detail-hero,
:global(html.dark) .detail-main-card,
:global(html.dark) .meta-card {
  box-shadow: 0 12px 32px rgba(2, 6, 23, 0.35);
}

:global(html.dark) .detail-hero {
  background: color-mix(in srgb, var(--et-bg-container) 82%, transparent);
  border-color: rgba(51, 65, 85, 0.5);
}

:global(html.dark) .detail-hero-side,
:global(html.dark) .detail-main-card,
:global(html.dark) .meta-card,
:global(html.dark) .function-card {
  background: rgba(15, 23, 42, 0.82);
}

:global(html.dark) .hero-image.placeholder {
  background: color-mix(in srgb, var(--et-bg-container) 72%, transparent);
  color: var(--et-text-secondary);
}

@media (max-width: 1100px) {

  .detail-hero,
  .detail-body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .pluginstore-detail {
    padding: 14px;
  }

  .detail-title {
    font-size: 24px;
  }

  .detail-hero {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .detail-main-card {
    padding: 16px;
  }
}
</style>