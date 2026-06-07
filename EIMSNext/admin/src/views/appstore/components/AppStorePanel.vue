<template>
  <div class="appstore-page">
    <section class="market-hero">
      <div class="hero-copy">
        <h1 class="hero-title">{{ $t("admin.appStore.title") }}</h1>
        <p class="hero-subtitle">{{ $t("admin.appStore.subtitle") }}</p>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-value">{{ profileItems.length }}</span>
            <span class="hero-stat-label">{{ $t("admin.appStore.totalTemplates") }}</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-value">{{ featuredPool.length }}</span>
            <span class="hero-stat-label">{{ $t("admin.appStore.featuredTemplates") }}</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-value">{{ industries.length }}</span>
            <span class="hero-stat-label">{{ $t("admin.appStore.industries") }}</span>
          </div>
        </div>
      </div>

      <div class="hero-search-card">
        <div class="hero-search-title">{{ $t("admin.appStore.findTemplates") }}</div>
        <div class="hero-search-subtitle">{{ $t("admin.appStore.filterDesc") }}</div>
        <el-input v-model="keyword" class="search-input" :placeholder="$t('admin.appStore.searchPlaceholder')" @keyup.enter="loadProfiles">
          <template #append>
            <el-button @click="loadProfiles">{{ $t("admin.appStore.search") }}</el-button>
          </template>
        </el-input>
      </div>
    </section>

    <div class="market-layout">
      <aside class="market-sidebar">
        <div class="sidebar-section">
          <div class="sidebar-section-title">{{ $t("admin.appStore.category") }}</div>
          <button class="sidebar-item" :class="{ active: !activeCategory }" @click="setCategory('')">{{ $t("admin.appStore.allCategories") }}</button>
          <button v-for="category in categories" :key="category" class="sidebar-item"
            :class="{ active: activeCategory === category }" @click="setCategory(category)">
            {{ category }}
          </button>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-section-title">{{ $t("admin.appStore.industry") }}</div>
          <button class="sidebar-item" :class="{ active: !activeIndustry }" @click="setIndustry('')">{{ $t("admin.appStore.allIndustries") }}</button>
          <button v-for="industry in industries" :key="industry" class="sidebar-item"
            :class="{ active: activeIndustry === industry }" @click="setIndustry(industry)">
            {{ industry }}
          </button>
        </div>
      </aside>

      <main class="market-content">
        <section class="market-section">
          <div class="section-head">
            <div>
              <div class="section-title">{{ $t("admin.appStore.featured") }}</div>
              <div class="section-subtitle">{{ $t("admin.appStore.featuredDesc") }}</div>
            </div>
            <el-button link type="primary" @click="rotateFeatured">{{ $t("admin.appStore.rotate") }}</el-button>
          </div>

          <div class="featured-grid">
            <div v-for="item in featuredItems" :key="item.id" class="market-card featured-card"
              @click="openDetail(item.id)">
              <div class="market-cover">
                <img v-if="coverImage(item)" :src="coverImage(item)!" :alt="item.name" />
                <div class="card-badges">
                  <span v-if="item.isOfficial" class="badge badge-official">{{ $t("admin.official") }}</span>
                  <span v-else-if="item.isHot" class="badge badge-hot">{{ $t("admin.hot") }}</span>
                </div>
              </div>

              <div class="market-card-body">
                <div class="market-card-title">{{ item.name }}</div>
                <div class="market-card-desc">{{ item.summary }}</div>
                <div class="market-tags">
                  <span v-for="tag in (item.tags || []).slice(0, 4)" :key="tag" class="market-tag">{{ tag }}</span>
                </div>
                <div class="market-meta">
                  <span>{{ item.category || $t("admin.appStore.generalCategory") }}</span>
                  <span>{{ item.installCount || 0 }} {{ $t("admin.appStore.installs") }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="market-section">
          <div class="section-head">
            <div>
              <div class="section-title">{{ $t("admin.appStore.allTemplates") }}</div>
              <div class="section-subtitle">{{ $t("admin.appStore.allTemplatesDesc") }}</div>
            </div>
          </div>

          <div class="market-grid">
            <div v-for="item in profileItems" :key="item.id" class="market-card grid-card" @click="openDetail(item.id)">
              <div class="market-cover compact">
                <img v-if="coverImage(item)" :src="coverImage(item)!" :alt="item.name" />
                <div class="card-badges">
                  <span v-if="item.isOfficial" class="badge badge-official">{{ $t("admin.official") }}</span>
                </div>
              </div>

              <div class="market-card-body">
                <div class="market-list-head">
                  <div class="market-card-title">{{ item.name }}</div>
                  <div class="market-card-extra">{{ item.author || $t("admin.developer") }}</div>
                </div>
                <div class="market-card-desc two-line">{{ item.summary }}</div>
                <div class="market-tags small">
                  <span v-for="tag in (item.tags || []).slice(0, 5)" :key="tag" class="market-tag">{{ tag }}</span>
                </div>
                <div class="market-meta">
                  <span>{{ item.industry || $t("admin.appStore.generalIndustry") }}</span>
                  <span>{{ item.installCount || 0 }} {{ $t("admin.appStore.installs") }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <AppStoreDetailDialog v-model="detailVisible" :app-id="selectedId" @install-success="handleInstallSuccess" />
  </div>
</template>

<script setup lang="ts">
import type { AppProfile } from "@eimsnext/models";
import { appProfileService } from "@eimsnext/services";
import { useRouter } from "vue-router";
import AppStoreDetailDialog from "./AppStoreDetailDialog.vue";

defineOptions({ name: "AppStorePanel" });

const props = withDefaults(defineProps<{
}>(), {
});

const emit = defineEmits<{
  (e: "close"): void;
}>();

const router = useRouter();
const keyword = ref("");
const activeCategory = ref("");
const activeIndustry = ref("");
const profileItems = ref<AppProfile[]>([]);
const featuredStart = ref(0);
const selectedId = ref("");
const detailVisible = ref(false);

const categories = computed(() => Array.from(new Set(profileItems.value.map((item: AppProfile) => item.category).filter(Boolean))) as string[]);
const industries = computed(() => Array.from(new Set(profileItems.value.map((item: AppProfile) => item.industry).filter(Boolean))) as string[]);
const featuredPool = computed(() => {
  const preferred = profileItems.value.filter((item: AppProfile) => item.isRecommended || item.isOfficial || item.isHot);
  return preferred.length > 0 ? preferred : profileItems.value;
});
const featuredItems = computed(() => {
  const pool = featuredPool.value;
  if (pool.length <= 4) return pool;
  return Array.from({ length: 4 }, (_, index) => pool[(featuredStart.value + index) % pool.length]);
});

function coverImage(item: AppProfile) {
  return item.coverImage || item.bannerImage;
}

async function loadProfiles() {
  const result = await appProfileService.query({
    keyword: keyword.value,
    category: activeCategory.value,
    industry: activeIndustry.value,
    take: 60,
  });
  profileItems.value = result.items || [];
  featuredStart.value = 0;
}

function rotateFeatured() {
  if (featuredPool.value.length <= 4) return;
  featuredStart.value = (featuredStart.value + 4) % featuredPool.value.length;
}

function setCategory(category: string) {
  activeCategory.value = category;
  loadProfiles();
}

function setIndustry(industry: string) {
  activeIndustry.value = industry;
  loadProfiles();
}

function openDetail(id: string) {
  selectedId.value = id;
  detailVisible.value = true;
}

function handleInstallSuccess() {
  detailVisible.value = false;
  selectedId.value = "";
  emit("close");
  router.push("/workspace");
}

onMounted(loadProfiles);
</script>

<style scoped lang="scss">
.appstore-page {
  width: 1000px;
  min-height: 100%;
  background: color-mix(in srgb, var(--et-bg-container) 98%, transparent);
  color: var(--et-text-primary);
}

.market-hero,
.market-sidebar,
.market-content,
.market-card {
  border: 1px solid color-mix(in srgb, var(--et-border-color-light) 78%, transparent);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.06);
}

.market-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 420px);
  gap: 20px;
  padding: 20px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--et-bg-container) 92%, transparent);
}

.hero-title {
  margin: 16px 0 10px;
  font-size: 36px;
  line-height: 1.12;
}

.hero-subtitle {
  max-width: 620px;
  color: var(--et-text-secondary);
  font-size: 15px;
  line-height: 1.7;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 20px;
}

.hero-stat {
  padding: 16px 18px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--et-bg-container) 86%, transparent);
}

.hero-stat-value {
  display: block;
  font-size: 26px;
  font-weight: 700;
}

.hero-stat-label {
  display: block;
  margin-top: 6px;
  color: var(--et-text-secondary);
  font-size: 13px;
}

.hero-search-card {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--et-bg-container) 92%, transparent);
}

.hero-search-title {
  font-size: 20px;
  font-weight: 700;
}

.hero-search-subtitle {
  margin-top: 8px;
  margin-bottom: 18px;
  color: var(--et-text-secondary);
  line-height: 1.6;
}

.market-layout {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: 20px;
  margin-top: 20px;
  align-items: start;
}

.market-sidebar {
  position: sticky;
  top: 20px;
  padding: 20px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--et-bg-container) 96%, transparent);
}

.sidebar-section+.sidebar-section {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--et-border-color-light);
}

.sidebar-section-title {
  margin-bottom: 10px;
  padding: 0 8px;
  color: var(--et-text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.sidebar-item {
  width: 100%;
  margin-bottom: 4px;
  padding: 11px 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--et-text-primary);
  text-align: left;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.sidebar-item:hover,
.sidebar-item.active {
  background: var(--et-bg-hover);
  color: var(--et-text-primary);
  font-weight: 600;
}

.market-content {
  padding: 20px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--et-bg-container) 98%, transparent);
}

.market-section+.market-section {
  margin-top: 28px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
}

.section-subtitle {
  margin-top: 6px;
  color: var(--et-text-secondary);
}

.featured-grid,
.market-grid {
  display: grid;
  gap: 20px;
}

.featured-grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.market-grid {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.market-card {
  overflow: hidden;
  border-radius: 24px;
  background: color-mix(in srgb, var(--et-bg-container) 98%, transparent);
  color: inherit;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
}

.market-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--et-color-warning) 26%, var(--et-border-color-light));
  box-shadow: 0 22px 36px color-mix(in srgb, var(--et-color-warning) 12%, transparent);
}

.market-cover {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.market-cover.compact {
  aspect-ratio: 16 / 8.7;
}

.market-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-badges {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
}

.badge {
  padding: 4px 10px;
  border-radius: 999px;
  color: #fff;
  font-size: 12px;
  line-height: 1;
}

.badge-official {
  background: var(--et-color-primary);
}

.badge-hot {
  background: var(--et-color-warning);
}

.market-card-body {
  padding: 18px;
}

.market-card-title {
  font-size: 27px;
  font-weight: 700;
  line-height: 1.2;
}

.grid-card .market-card-title {
  font-size: 22px;
}

.market-card-desc {
  margin-top: 10px;
  color: var(--et-text-secondary);
  line-height: 1.7;
}

.market-card-desc.two-line {
  min-height: 54px;
}

.market-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.market-tags.small {
  margin-top: 14px;
}

.market-tag {
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--et-fill-color-light) 86%, transparent);
  color: var(--et-text-secondary);
  font-size: 12px;
}

.market-meta,
.market-list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.market-meta {
  margin-top: 16px;
  color: var(--et-text-tertiary);
  font-size: 13px;
}

.market-card-extra {
  color: var(--et-text-tertiary);
  font-size: 13px;
  white-space: nowrap;
}

:global(html.dark) .appstore-page {
  background: color-mix(in srgb, var(--et-bg-container) 82%, transparent);
}

:global(html.dark) .market-hero,
:global(html.dark) .market-sidebar,
:global(html.dark) .market-content,
:global(html.dark) .market-card {
  box-shadow: var(--et-shadow-overlay);
}

:global(html.dark) .market-hero {
  background: color-mix(in srgb, var(--et-bg-container) 82%, transparent);
}

:global(html.dark) .hero-search-card,
:global(html.dark) .hero-stat,
:global(html.dark) .market-sidebar,
:global(html.dark) .market-content,
:global(html.dark) .market-card {
  background: color-mix(in srgb, var(--et-bg-container) 82%, transparent);
}

:global(html.dark) .sidebar-item.active {
  color: var(--et-color-warning);
}

@media (max-width: 1200px) {
  .market-layout {
    grid-template-columns: 1fr;
  }

  .market-sidebar {
    position: static;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .sidebar-section+.sidebar-section {
    margin-top: 0;
    padding-top: 0;
    border-top: 0;
  }
}

@media (max-width: 960px) {
  .appstore-page {
    padding: 16px;
  }

  .market-hero,
  .market-sidebar {
    grid-template-columns: 1fr;
  }

  .hero-title,
  .section-title {
    font-size: 26px;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .market-content {
    padding: 18px;
  }
}
</style>
