<template>
  <div class="app-admin-page">
    <AddEditApp v-if="showEditApp" :edit="true" :app="app" @cancel="showEditApp = false" @ok="onAppEdited" />
    <et-dialog v-model="showHomeDialog" :title="t('admin.appAdmin.homeEntries')" width="680px" @ok="saveHomeEntries" @cancel="showHomeDialog = false">
      <div class="home-dialog">
        <div class="home-column">
          <el-input v-model="dashboardKeyword" clearable :placeholder="t('admin.appAdmin.searchByName')">
            <template #prefix><et-icon icon="el-search" size="14px" /></template>
          </el-input>
          <div class="home-list">
            <div
              v-for="item in filteredDashboards"
              :key="item.id"
              class="home-list-item"
              :class="{ selected: draftHomeEntryIds.includes(item.id) }"
              @click="toggleHomeEntry(item.id)"
            >
              <et-icon :icon="item.icon || 'dashboard'" size="14px" />
              <span>{{ item.title }}</span>
              <et-icon v-if="draftHomeEntryIds.includes(item.id)" icon="el-check" size="14px" />
            </div>
          </div>
        </div>
        <div class="home-column selected-column">
          <div class="selected-count">{{ t("admin.appAdmin.selectedHomeCount", { count: draftHomeEntryIds.length, max: maxHomeEntries }) }}</div>
          <div class="home-list">
            <div v-for="(id, index) in draftHomeEntryIds" :key="id" class="home-list-item">
              <span class="drag-mark">::</span>
              <span>{{ dashboardTitle(id) }}</span>
              <div class="item-actions">
                <el-button link :disabled="index === 0" @click.stop="moveHome(index, -1)">{{ t("common.moveUp") }}</el-button>
                <el-button link :disabled="index === draftHomeEntryIds.length - 1" @click.stop="moveHome(index, 1)">{{ t("common.moveDown") }}</el-button>
                <el-button link type="danger" @click.stop="removeHome(id)">{{ t("common.delete") }}</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </et-dialog>

    <div class="page-card">
      <div class="page-title">{{ t("admin.appAdmin.settings") }}</div>
      <div v-if="app" class="settings-table">
        <div class="settings-row">
          <div class="settings-label">{{ t("comp.addEditApp.appName") }}</div>
          <div class="settings-value">
            <span>{{ app.name }}</span>
            <el-button link type="primary" @click="showEditApp = true">{{ t("common.edit") }}</el-button>
          </div>
        </div>
        <div class="settings-row">
          <div class="settings-label">{{ t("comp.addEditApp.appIcon") }}</div>
          <div class="settings-value">
            <AppIcon :app="app" icon-size="28px" class="app-icon-preview" />
            <el-button link type="primary" @click="showEditApp = true">{{ t("common.edit") }}</el-button>
          </div>
        </div>
        <div class="settings-row">
          <div class="settings-label">{{ t("admin.appAdmin.homeEntries") }}</div>
          <div class="settings-value">
            <el-button @click="openHomeDialog">{{ t("admin.appAdmin.set") }}</el-button>
            <span class="value-tip">{{ homeEntryText }}</span>
          </div>
        </div>
        <div class="settings-row">
          <div class="settings-label">{{ t("admin.appAdmin.appUrl") }}</div>
          <div class="settings-value value-grow">
            <el-input :model-value="appUrl" readonly>
              <template #append>
                <el-button @click="copy(appUrl)">{{ t("common.copy") }}</el-button>
                <el-button @click="openUrl(appUrl)">{{ t("comp.shareLinkBar.open") }}</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <div class="settings-row">
          <div class="settings-label">{{ t("common.appid") }}</div>
          <div class="settings-value">
            <span>{{ app.id }}</span>
            <el-button link type="primary" @click="copy(app.id)">{{ t("common.copy") }}</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AddEditApp from "@/views/app/components/AddEditApp.vue";
import { AppDef, FormType } from "@eimsnext/models";
import { appDefService } from "@eimsnext/services";
import { useAppStore, useContextStore } from "@eimsnext/store";
import { ElMessage } from "element-plus";
import { AppMenuItem, flattenAppMenus } from "./utils";
import { useI18n } from "vue-i18n";

const appStore = useAppStore();
const contextStore = useContextStore();
const { t } = useI18n();
const app = ref<AppDef>();
const showEditApp = ref(false);
const showHomeDialog = ref(false);
const dashboardKeyword = ref("");
const draftHomeEntryIds = ref<string[]>([]);
const maxHomeEntries = 10;

const appUrl = computed(() => `${window.location.origin}${window.location.pathname}#/app/${contextStore.appId}`);
const dashboards = computed(() => flattenAppMenus(app.value?.appMenus || []).filter((item) => item.type === FormType.Dashboard));
const filteredDashboards = computed(() => {
  const keyword = dashboardKeyword.value.trim().toLowerCase();
  if (!keyword) return dashboards.value;
  return dashboards.value.filter((item) => item.title.toLowerCase().includes(keyword));
});
const homeEntryText = computed(() => {
  const titles = (app.value?.homeEntryIds || []).map((id: string) => dashboardTitle(id)).filter(Boolean);
  return titles.length ? titles.join(t("common.listSeparator")) : t("common.notset");
});

async function loadApp() {
  app.value = await appStore.get(contextStore.appId, false);
}

function onAppEdited(updated: AppDef) {
  app.value = updated;
  appStore.update(updated);
  showEditApp.value = false;
}

function openHomeDialog() {
  const validIds = new Set(dashboards.value.map((item) => item.id));
  draftHomeEntryIds.value = (app.value?.homeEntryIds || []).filter((id) => validIds.has(id));
  dashboardKeyword.value = "";
  showHomeDialog.value = true;
}

function toggleHomeEntry(id: string) {
  if (draftHomeEntryIds.value.includes(id)) {
    removeHome(id);
    return;
  }

  if (draftHomeEntryIds.value.length >= maxHomeEntries) {
    ElMessage.warning(t("admin.appAdmin.maxHomeEntries", { max: maxHomeEntries }));
    return;
  }

  draftHomeEntryIds.value.push(id);
}

function removeHome(id: string) {
  draftHomeEntryIds.value = draftHomeEntryIds.value.filter((item) => item !== id);
}

function moveHome(index: number, offset: number) {
  const nextIndex = index + offset;
  if (nextIndex < 0 || nextIndex >= draftHomeEntryIds.value.length) return;
  const next = [...draftHomeEntryIds.value];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  draftHomeEntryIds.value = next;
}

async function saveHomeEntries() {
  if (!app.value) return;
  const updated = await appDefService.patch<AppDef>(app.value.id, {
    id: app.value.id,
    homeEntryIds: draftHomeEntryIds.value,
  });
  app.value = updated;
  appStore.update(updated);
  contextStore.setAppChanged();
  showHomeDialog.value = false;
  ElMessage.success(t("common.saveSuccess"));
}

function dashboardTitle(id: string) {
  return dashboards.value.find((item: AppMenuItem) => item.id === id)?.title || "";
}

async function copy(text: string) {
  await navigator.clipboard.writeText(text);
  ElMessage.success(t("comp.triggerNodeMeta.copied"));
}

function openUrl(url: string) {
  window.open(url, "_blank");
}

onBeforeMount(loadApp);
</script>

<style scoped lang="scss">
.app-admin-page {
  height: 100%;
  padding: var(--et-space-12);
}

.page-card {
  background: var(--et-bg-container);
  border: 1px solid var(--et-border-color-light);
  border-radius: var(--et-radius-8);
  height: 100%;
  overflow: auto;
}

.page-title {
  border-bottom: 1px solid var(--et-border-color-light);
  font-size: var(--et-font-size-16);
  font-weight: 700;
  height: var(--et-size-56);
  line-height: var(--et-size-56);
  padding: 0 var(--et-space-20);
}

.settings-table {
  padding: var(--et-space-16);
}

.settings-row {
  display: flex;
  min-height: var(--et-size-80);
}

.settings-label {
  align-items: center;
  background: var(--et-bg-page);
  display: flex;
  flex: 0 0 var(--et-size-130);
  justify-content: center;
}

.settings-value {
  align-items: center;
  border-bottom: 1px solid var(--et-border-color-light);
  display: flex;
  gap: var(--et-space-14);
  min-width: 0;
  padding: 0 var(--et-space-24);
}

.value-grow {
  flex: 1;
  max-width: var(--et-size-760);
}

.value-tip {
  color: var(--et-text-secondary);
}

.app-icon-preview {
  height: var(--et-size-52);
  width: var(--et-size-52);
}

.home-dialog {
  border: 1px solid var(--et-border-color);
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: var(--et-size-450);
}

.home-column {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: var(--et-space-10);
}

.home-column + .home-column {
  border-left: 1px solid var(--et-border-color);
}

.selected-count {
  color: var(--et-color-primary);
  height: var(--et-size-32);
  line-height: var(--et-size-32);
}

.home-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-top: var(--et-space-8);
}

.home-list-item {
  align-items: center;
  border-radius: var(--et-radius-6);
  cursor: pointer;
  display: flex;
  gap: var(--et-space-8);
  min-height: var(--et-size-34);
  padding: 0 var(--et-space-8);

  span:nth-child(2) {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.selected {
    background: var(--et-bg-primary-soft);
    color: var(--et-color-primary);
  }
}

.drag-mark {
  color: var(--et-text-tertiary);
}

.item-actions {
  display: flex;
  flex-shrink: 0;
}
</style>
