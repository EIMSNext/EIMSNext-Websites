<template>
  <div class="pluginstore-page">
    <div class="toolbar-card">
      <el-input
        v-model="keyword"
        class="search-input"
        :placeholder="$t('admin.plugin.searchPlugin')"
        @keyup.enter="loadProfiles"
      >
        <template #prefix>
          <et-icon icon="el-Search" size="15" />
        </template>
      </el-input>
    </div>

    <div class="pluginstore-layout">
      <aside class="filter-panel">
        <div class="filter-scroll">
          <div class="filter-group">
            <button
              class="filter-all"
              :class="{ active: !activeCategory && !activeScenario }"
              @click="resetFilters"
            >
              {{ $t("admin.plugin.allPlugins") }}
            </button>
          </div>

          <div class="filter-group">
            <div class="filter-title-row">
              <span class="filter-title">
                <et-icon icon="el-Box" size="13" />
                {{ $t("admin.plugin.toolType") }}
              </span>
              <et-icon icon="el-ArrowUp" size="12" />
            </div>
            <div class="filter-items">
              <button
                class="filter-item"
                :class="{ active: !activeCategory }"
                @click="setCategory('')"
              >
                {{ $t("admin.plugin.latestPlugins") }}
              </button>
              <button
                v-for="category in categories"
                :key="category"
                class="filter-item"
                :class="{ active: activeCategory === category }"
                @click="setCategory(category)"
              >
                {{ category }}
              </button>
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-title-row">
              <span class="filter-title">
                <et-icon icon="el-Grid" size="13" />
                {{ $t("admin.plugin.bizScenario") }}
              </span>
              <et-icon icon="el-ArrowUp" size="12" />
            </div>
            <div class="filter-items">
              <button
                class="filter-item"
                :class="{ active: !activeScenario }"
                @click="setScenario('')"
              >
                {{ $t("admin.plugin.allScenarios") }}
              </button>
              <button
                v-for="scenario in scenarios"
                :key="scenario"
                class="filter-item"
                :class="{ active: activeScenario === scenario }"
                @click="setScenario(scenario)"
              >
                {{ scenario }}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main class="content-panel">
        <section class="plugin-section">
          <div class="section-head">
            <div class="section-title">{{ $t("admin.plugin.featuredPlugins") }}</div>
          </div>
          <div class="plugin-grid featured-grid">
            <div
              v-for="item in featuredItems"
              :key="item.id"
              class="plugin-card"
              @click="openDetail(item)"
            >
              <span v-if="item.installed" class="card-corner-badge">
                {{ $t("admin.plugin.installed") }}
              </span>
              <div class="plugin-card-top">
                <div class="plugin-info">
                  <img v-if="item.icon" class="plugin-icon" :src="item.icon" :alt="item.name" />
                  <div class="plugin-copy">
                    <div class="plugin-name">{{ item.name }}</div>
                    <div class="plugin-summary">{{ item.summary }}</div>
                  </div>
                </div>
                <div class="plugin-side-meta">
                  <span class="install-count">{{ formatInstallCount(item.installCount) }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="plugin-section">
          <div class="section-head">
            <div class="section-title">{{ $t("admin.plugin.allPlugins") }}</div>
          </div>
          <div class="plugin-grid all-grid">
            <div
              v-for="item in profileItems"
              :key="item.id"
              class="plugin-card"
              @click="openDetail(item)"
            >
              <span v-if="item.installed" class="card-corner-badge">
                {{ $t("admin.plugin.installed") }}
              </span>
              <div class="plugin-card-top">
                <div class="plugin-info">
                  <img v-if="item.icon" class="plugin-icon" :src="item.icon" :alt="item.name" />
                  <div class="plugin-copy">
                    <div class="plugin-name">{{ item.name }}</div>
                    <div class="plugin-summary">{{ item.summary }}</div>
                  </div>
                </div>
                <div class="plugin-side-meta">
                  <span class="install-count">{{ formatInstallCount(item.installCount) }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <PluginDetail
      v-model="detailVisible"
      :profile-id="selectedProfileId"
      @installed="onDetailInstalled"
    />
  </div>
</template>

<script setup lang="ts">
import type { PluginProfile } from "@eimsnext/models";
import { pluginProfileService } from "@eimsnext/services";
import PluginDetail from "./components/PluginDetail.vue";

defineOptions({ name: "PluginStorePage" });

const keyword = ref("");
const activeCategory = ref("");
const activeScenario = ref("");
const profileItems = ref<PluginProfile[]>([]);
const detailVisible = ref(false);
const selectedProfileId = ref("");

const categories = computed(
  () =>
    Array.from(
      new Set(profileItems.value.map((item: PluginProfile) => item.category).filter(Boolean))
    ) as string[]
);
const scenarios = computed(
  () =>
    Array.from(
      new Set(profileItems.value.map((item: PluginProfile) => item.scenario).filter(Boolean))
    ) as string[]
);
const featuredItems = computed(() => {
  const preferred = profileItems.value.filter(
    (item: PluginProfile) => item.isRecommended || item.isOfficial || item.isHot
  );
  return (preferred.length ? preferred : profileItems.value).slice(0, 8);
});

function formatInstallCount(count?: number) {
  if (!count) return "0+";
  if (count >= 1000) return "1000+";
  if (count >= 500) return "500+";
  if (count >= 100) return "100+";
  if (count >= 10) return "10+";
  return `${count}+`;
}

async function loadProfiles() {
  const result = await pluginProfileService.query({
    keyword: keyword.value,
    category: activeCategory.value,
    scenario: activeScenario.value,
    take: 60,
  });
  profileItems.value = result.items || [];
}

function resetFilters() {
  activeCategory.value = "";
  activeScenario.value = "";
  loadProfiles();
}

function setCategory(category: string) {
  activeCategory.value = category;
  loadProfiles();
}

function setScenario(scenario: string) {
  activeScenario.value = scenario;
  loadProfiles();
}

function openDetail(item: PluginProfile) {
  selectedProfileId.value = item.id;
  detailVisible.value = true;
}

function onDetailInstalled() {
  loadProfiles();
}

onMounted(loadProfiles);
</script>

<style scoped lang="scss">
.pluginstore-page {
  min-height: 100%;
}

.toolbar-card,
.filter-panel,
.content-panel,
.plugin-card {
  border: 1px solid color-mix(in srgb, var(--et-border-color-light) 80%, transparent);
  background: color-mix(in srgb, var(--et-bg-container) 98%, transparent);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.toolbar-card {
  padding: 10px 14px;
  border-radius: 10px;
}

.search-input {
  max-width: 380px;
}

.pluginstore-layout {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.filter-panel {
  border-radius: 10px;
  padding: 10px 8px;
}

.filter-scroll {
  max-height: calc(100vh - 170px);
  overflow: auto;
  padding-right: 2px;
}

.filter-group + .filter-group {
  border-top: 1px solid color-mix(in srgb, var(--et-border-color-light) 72%, transparent);
}

.filter-all,
.filter-item {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--et-text-primary);
  text-align: left;
  cursor: pointer;
}

.filter-all {
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid transparent;
}

.filter-all.active {
  background: var(--et-bg-primary-soft);
  border-color: color-mix(in srgb, var(--et-color-primary) 18%, transparent);
  color: var(--et-color-primary);
}

.filter-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  margin-bottom: 6px;
  line-height: 40px;
}

.filter-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
}

.filter-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.filter-item {
  padding: 8px 12px 8px 28px;
  border-radius: 8px;
  font-size: 13px;
  color: var(--et-text-secondary);
  border: 1px solid transparent;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.filter-item:hover {
  background: var(--et-bg-hover);
  color: var(--et-text-primary);
}
.filter-item.active {
  background: var(--et-bg-primary-soft);
  border-color: color-mix(in srgb, var(--et-color-primary) 18%, transparent);
  color: var(--et-color-primary);
}
.content-panel {
  border-radius: 10px;
  padding: 14px 16px 20px;
}

.plugin-section + .plugin-section {
  margin-top: 28px;
}

.section-head {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
}

.section-title {
  position: relative;
  padding-left: 12px;
  font-size: 15px;
  font-weight: 700;
}

.section-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 4px;
  border-radius: 999px;
  background: var(--et-color-primary);
}

.plugin-grid {
  display: grid;
  gap: 12px;
}

.featured-grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.all-grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.plugin-card {
  position: relative;
  min-height: 130px;
  border-radius: 10px;
  padding: 14px 14px 12px;
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.plugin-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--et-color-primary) 22%, var(--et-border-color-light));
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.08);
}

.card-corner-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px 10px 5px;
  border-radius: 0 10px 0 8px;
  background: color-mix(in srgb, var(--et-bg-page) 94%, white);
  color: var(--et-text-primary);
  font-size: 11px;
  line-height: 1;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

.plugin-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.plugin-info {
  display: flex;
  gap: 12px;
  min-width: 0;
}

.plugin-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  flex: 0 0 auto;
}

.plugin-copy {
  min-width: 0;
}

.plugin-name {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
}

.plugin-summary {
  margin-top: 6px;
  color: var(--et-text-secondary);
  font-size: 13px;
  line-height: 1.6;
  overflow: hidden;
}

.plugin-side-meta {
  position: absolute;
  bottom: 12px;
  right: 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex: 0 0 auto;
}

.install-count {
  color: var(--et-text-tertiary);
  font-size: 11px;
  white-space: nowrap;
}

:global(html.dark) .card-corner-badge {
  background: rgba(30, 41, 59, 0.95);
  color: #e2e8f0;
  box-shadow: 0 4px 12px rgba(2, 6, 23, 0.28);
}

:global(html.dark) .toolbar-card,
:global(html.dark) .filter-panel,
:global(html.dark) .content-panel,
:global(html.dark) .plugin-card {
  background: rgba(15, 23, 42, 0.82);
  box-shadow: 0 12px 32px rgba(2, 6, 23, 0.32);
}

@media (max-width: 1100px) {
  .pluginstore-layout {
    grid-template-columns: 1fr;
  }

  .filter-scroll {
    max-height: none;
  }
}

@media (max-width: 768px) {
  .plugin-grid {
    grid-template-columns: 1fr;
  }
}
</style>
