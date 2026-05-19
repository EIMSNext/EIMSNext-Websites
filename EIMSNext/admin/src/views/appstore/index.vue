<template>
  <div class="appstore-page">
    <div class="appstore-hero">
      <div>
        <div class="appstore-title">应用商店</div>
        <div class="appstore-subtitle">发现开箱即用的业务应用模板</div>
      </div>
      <el-input v-model="keyword" class="search-input" placeholder="请输入应用名称" @keyup.enter="loadProfiles">
        <template #append>
          <el-button @click="loadProfiles">搜索</el-button>
        </template>
      </el-input>
    </div>

    <div class="appstore-layout">
      <aside class="sidebar-card">
        <div class="sidebar-title">分类</div>
        <el-scrollbar>
          <button class="side-item" :class="{ active: !activeCategory }" @click="setCategory('')">全部场景</button>
          <button v-for="category in categories" :key="category" class="side-item" :class="{ active: activeCategory === category }" @click="setCategory(category)">
            {{ category }}
          </button>
        </el-scrollbar>
      </aside>

      <main class="content-card">
        <section>
          <div class="section-head">
            <h2>为你推荐</h2>
          </div>
          <div class="card-grid">
            <router-link v-for="item in recommendedItems" :key="item.id" :to="`/appstore/${item.id}`" class="template-card">
              <div class="cover" :style="coverStyle(item)">
                <img v-if="item.coverImage" :src="item.coverImage" :alt="item.name" />
                <span v-if="item.isOfficial" class="badge badge-official">官方</span>
                <span v-else-if="item.isHot" class="badge badge-hot">热门</span>
              </div>
              <div class="card-body">
                <div class="card-title">{{ item.name }}</div>
                <div class="card-desc">{{ item.summary }}</div>
                <div class="tag-row">
                  <span v-for="tag in item.tags || []" :key="tag" class="tag">{{ tag }}</span>
                </div>
                <div class="meta-row">安装量 {{ item.installCount || 0 }}</div>
              </div>
            </router-link>
          </div>
        </section>

        <section>
          <div class="section-head">
            <h2>全部模板</h2>
          </div>
          <div class="card-grid">
            <router-link v-for="item in profileItems" :key="item.id" :to="`/appstore/${item.id}`" class="template-card template-card--soft">
              <div class="cover" :style="coverStyle(item)">
                <img v-if="item.coverImage" :src="item.coverImage" :alt="item.name" />
              </div>
              <div class="card-body">
                <div class="card-title">{{ item.name }}</div>
                <div class="card-desc">{{ item.summary }}</div>
                <div class="meta-row">{{ item.author || 'EIMSNext' }}</div>
              </div>
            </router-link>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AppProfile } from "@eimsnext/models";
import { appProfileService } from "@eimsnext/services";

defineOptions({ name: "AppStorePage" });

const keyword = ref("");
const activeCategory = ref("");
const profileItems = ref<AppProfile[]>([]);

const categories = computed(() =>
  Array.from(new Set(profileItems.value.map((item: AppProfile) => item.category).filter(Boolean))) as string[],
);
const recommendedItems = computed(() =>
  profileItems.value.filter((item: AppProfile) => item.isRecommended).slice(0, 4),
);

function coverStyle(item: AppProfile) {
  return {
    background: item.themeColor ? `linear-gradient(135deg, ${item.themeColor}22, ${item.themeColor}66)` : undefined,
  };
}

async function loadProfiles() {
  const result = await appProfileService.query({ keyword: keyword.value, category: activeCategory.value, take: 60 });
  profileItems.value = result.items || [];
}

function setCategory(category: string) {
  activeCategory.value = category;
  loadProfiles();
}

onMounted(loadProfiles);
</script>

<style scoped lang="scss">
.appstore-page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--et-bg-page) 0%, var(--et-bg-container) 100%);
  color: var(--et-text-primary);
  padding: 32px;
}

.appstore-hero {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.appstore-title {
  font-size: 32px;
  font-weight: 700;
}

.appstore-subtitle {
  margin-top: 8px;
  color: var(--et-text-secondary);
}

.search-input {
  max-width: 560px;
}

.appstore-layout {
  display: grid;
  gap: 24px;
  grid-template-columns: 240px 1fr;
}

.sidebar-card,
.content-card {
  background: var(--et-bg-container);
  border: 1px solid var(--et-border-color-light);
  border-radius: 24px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
}

.sidebar-card {
  padding: 24px 16px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
}

.side-item {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--et-text-primary);
  text-align: left;
  padding: 12px 14px;
  border-radius: 14px;
  cursor: pointer;
}

.side-item.active {
  background: color-mix(in srgb, var(--et-color-primary) 16%, transparent);
  color: var(--et-color-primary);
}

.content-card {
  padding: 24px;
}

.section-head {
  margin-bottom: 16px;
}

.card-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  margin-bottom: 28px;
}

.template-card {
  display: block;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid var(--et-border-color-light);
  text-decoration: none;
  color: inherit;
  background: var(--et-bg-container);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.template-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.12);
}

.template-card--soft {
  background: color-mix(in srgb, var(--et-bg-container) 88%, var(--et-color-primary) 12%);
}

.cover {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  color: #fff;
  font-size: 12px;
}

.badge-official { background: #2563eb; }
.badge-hot { background: #ef4444; }

.card-body {
  padding: 16px;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
}

.card-desc {
  margin-top: 10px;
  color: var(--et-text-secondary);
  min-height: 44px;
}

.tag-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.tag {
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--et-fill-color-light);
  font-size: 12px;
}

.meta-row {
  margin-top: 16px;
  color: var(--et-text-tertiary);
  font-size: 13px;
}

@media (max-width: 960px) {
  .appstore-page {
    padding: 20px;
  }

  .appstore-hero,
  .appstore-layout {
    grid-template-columns: 1fr;
    display: grid;
  }
}
</style>
