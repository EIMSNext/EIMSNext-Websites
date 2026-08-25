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
                  <span v-if="profile.isOfficial" class="status-badge official">{{ $t("admin.official") }}</span>
                  <span v-else-if="profile.isHot" class="status-badge hot">{{ $t("admin.hot") }}</span>
                  <span v-if="profile.installed" class="status-badge installed">{{ $t("admin.plugin.installed") }}</span>
                </div>
                <div class="detail-subtitle">{{ profile.summary }}</div>
                <div class="detail-tags">
                  <span v-for="tag in profile.tags || []" :key="tag" class="detail-tag">{{ tag }}</span>
                </div>
                <div class="detail-install-meta">{{ $t("admin.plugin.installs", { count: profile.installCount || 0 }) }}</div>
              </div>
            </div>
          </div>

          <div class="detail-hero-side">
            <div class="hero-side-title">{{ $t("admin.plugin.quickActions") }}</div>
            <div class="hero-side-text">{{ $t("admin.plugin.quickActionsDesc") }}</div>
            <div class="action-row">
              <el-button v-if="profile.helpDocUrl" plain @click="openLink(profile.helpDocUrl)">{{ $t("admin.plugin.usageGuide") }}</el-button>
              <el-button
                type="primary"
                size="large"
                :disabled="profile.installed || installing"
                :loading="installing"
                @click="install"
              >
                {{ profile.installed ? $t("admin.plugin.installed") : $t("admin.plugin.installPlugin") }}
              </el-button>
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
                <div class="panel-title with-bar">{{ $t("admin.plugin.pluginIntro") }}</div>
              </div>
              <p class="panel-text">{{ profile.description || profile.summary }}</p>
            </div>

            <div class="content-panel">
              <div class="panel-head">
                <div class="panel-title with-bar">{{ $t("admin.plugin.pluginFunctions") }}</div>
                <div class="panel-meta">{{ $t("admin.plugin.functions", { count: (profile.functions || []).length }) }}</div>
              </div>

              <div v-if="profile.functions?.length" class="function-grid">
                <div v-for="fn in profile.functions" :key="fn.id || fn.name" class="function-card">
                  <div class="function-name">{{ fn.name }}</div>
                  <div class="function-desc">{{ fn.description || $t("admin.plugin.noDescription") }}</div>
                  <div class="function-fields">
                    <span class="function-field-label">{{ $t("admin.plugin.functionInputs") }}</span>
                    <span v-for="field in flattenPluginFields(fn.inputFields || [])" :key="field.key" class="function-field-tag">
                      {{ field.name }}
                    </span>
                    <span v-if="!(fn.inputFields || []).length" class="function-field-tag muted">{{ $t("admin.plugin.noInputFields") }}</span>
                  </div>
                  <div class="function-fields">
                    <span class="function-field-label">{{ $t("admin.plugin.functionOutputs") }}</span>
                    <span v-for="field in flattenPluginFields(fn.resultFields || [])" :key="field.key" class="function-field-tag output">
                      {{ field.name }}
                    </span>
                    <span v-if="!(fn.resultFields || []).length" class="function-field-tag muted">{{ $t("admin.plugin.noResultFields") }}</span>
                  </div>
                </div>
              </div>

              <el-empty v-else :description="$t('pluginDetail.noFunctions')" />
            </div>
          </div>

          <aside class="detail-aside">
            <div class="meta-card">
              <div class="meta-label">{{ $t("admin.plugin.toolType") }}</div>
              <div class="meta-value">{{ profile.category || '-' }}</div>
            </div>
            <div class="meta-card">
              <div class="meta-label">{{ $t("admin.plugin.bizScenario") }}</div>
              <div class="meta-value">{{ profile.scenario || '-' }}</div>
            </div>
            <div class="meta-card">
              <div class="meta-label">{{ $t("admin.plugin.developer") }}</div>
              <div class="meta-value">{{ profile.developerName || $t("admin.developer") }}</div>
            </div>
            <div class="meta-card">
              <div class="meta-label">{{ $t("admin.version") }}</div>
              <div class="meta-value">{{ profile.version }}</div>
            </div>
            <div class="meta-card">
              <div class="meta-label">{{ $t("admin.installCount") }}</div>
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
import { useI18n } from "vue-i18n";

const { t } = useI18n();

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
const installing = ref(false);

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
    ElMessage.error(t("admin.plugin.loadFailed"));
  }
}

function onOpened() {
  if (props.profileId) {
    loadDetail();
  }
}

async function install() {
  if (!profile.value || profile.value.installed || installing.value) return;
  installing.value = true;
  try {
    await pluginProfileService.install(profile.value.id);
    ElMessage.success(t("admin.plugin.installSuccess"));
    profile.value.installed = true;
    emit("installed");
  } catch {
    ElMessage.error(t("admin.plugin.installFailed"));
  } finally {
    installing.value = false;
  }
}

function openLink(url?: string) {
  if (!url) return;
  window.open(url, "_blank");
}

function flattenPluginFields(fields: Array<{ key: string; name: string; subFields?: Array<{ key: string; name: string }> }>) {
  return fields.flatMap((field) => {
    const subFields = field.subFields?.map((subField) => ({
      key: `${field.key}>${subField.key}`,
      name: `${field.name} > ${subField.name}`,
    })) ?? [];
    return subFields.length ? subFields : [{ key: field.key, name: field.name }];
  });
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
  color: var(--et-text-primary);
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
  background: var(--et-color-primary);
  color: var(--et-text-on-primary);
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
  color: var(--et-text-secondary);
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

.function-field-label {
  color: var(--et-text-tertiary);
  font-size: 11px;
  line-height: 20px;
}

.function-field-tag.output {
  background: color-mix(in srgb, var(--et-color-primary) 12%, var(--et-bg-container));
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
