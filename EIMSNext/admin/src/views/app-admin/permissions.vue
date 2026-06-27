<template>
  <div class="app-admin-page">
    <div class="page-card">
      <div class="page-title">{{ t("admin.appAdmin.permissions") }}</div>
      <div class="permission-body">
        <aside class="menu-panel">
          <div class="step-title">{{ t("admin.appAdmin.selectTarget") }}</div>
          <el-input v-model="keyword" clearable :placeholder="t('common.search')">
            <template #prefix><et-icon icon="el-search" size="14px" /></template>
          </el-input>
          <el-scrollbar class="menu-scroll">
            <div
              v-for="item in filteredItems"
              :key="item.id"
              class="menu-item"
              :class="{ active: selectedItem?.id === item.id }"
              @click="selectItem(item)"
            >
              <et-icon :icon="item.type === FormType.Dashboard ? 'dashboard' : 'form'" size="14px" />
              <span>{{ item.title }}</span>
            </div>
          </el-scrollbar>
        </aside>
        <main class="config-panel">
          <div class="step-title">
            <span>{{ t("admin.appAdmin.configPermissions") }}</span>
            <small>{{ t("admin.appAdmin.configDesc") }}</small>
          </div>
          <InternalPublish v-if="selectedForm" :key="selectedForm.id" :form-def="selectedForm" />
          <div v-else-if="selectedDashboard" class="dashboard-permission">
            <div class="setting-row">
              <div>
                <div class="field-label">{{ t("admin.appAdmin.viewDashboard") }}</div>
                <div class="field-tip">{{ t("admin.appAdmin.viewDashboardDesc") }}</div>
              </div>
              <el-switch v-model="dashboardPublishEnabled" />
            </div>
            <SelectedTags v-model="dashboardTags" :editable="true" class="member-box" @editTag="showMemberDialog = true" />
            <div class="dashboard-actions">
              <el-button type="primary" @click="saveDashboardMembers">{{ t("common.save") }}</el-button>
            </div>
          </div>
          <el-empty v-else :description="t('admin.appAdmin.emptySelection')" />
        </main>
      </div>
    </div>
    <MemberSelectDialog
      v-model="showMemberDialog"
      :tags="dashboardTags"
      :member-options="memberOptions"
      @ok="finishSelectMembers"
    />
  </div>
</template>

<script setup lang="ts">
import InternalPublish from "@/components/FormEdit/Publish/InternalPublish.vue";
import { convertMemberTypeToTagType, convertTagTypeToMemberType } from "@/components/FormEdit/Publish/type";
import {
  DashboardDef,
  DashboardDefRequest,
  FormDef,
  FormType,
  Member,
} from "@eimsnext/models";
import { ISelectedTag, MemberSelectDialog, MemberTabs, SelectedTags } from "@eimsnext/components";
import { appDefService, dashboardDefService } from "@eimsnext/services";
import { useAppStore, useContextStore, useFormStore } from "@eimsnext/store";
import { ElMessage } from "element-plus";
import { AppMenuItem, flattenAppMenus } from "./utils";
import { useI18n } from "vue-i18n";

const contextStore = useContextStore();
const appStore = useAppStore();
const formStore = useFormStore();
const { t } = useI18n();
const keyword = ref("");
const items = ref<AppMenuItem[]>([]);
const selectedItem = ref<AppMenuItem>();
const selectedForm = ref<FormDef>();
const selectedDashboard = ref<DashboardDef>();
const dashboardTags = ref<ISelectedTag[]>([]);
const dashboardPublishEnabled = ref(false);
const showMemberDialog = ref(false);

const memberOptions = {
  showTabs: MemberTabs.Department | MemberTabs.Role | MemberTabs.Employee,
  cascadedDept: true,
  showCascade: true,
};

const filteredItems = computed(() => {
  const text = keyword.value.trim().toLowerCase();
  if (!text) return items.value;
  return items.value.filter((item) => item.title.toLowerCase().includes(text));
});

async function loadItems() {
  const app = await appStore.get(contextStore.appId, false);
  items.value = flattenAppMenus(app?.appMenus || []).filter((item) => item.type === FormType.Form || item.type === FormType.Dashboard);
  if (!selectedItem.value && items.value.length > 0) {
    await selectItem(items.value[0]);
  }
}

async function selectItem(item: AppMenuItem) {
  selectedItem.value = item;
  selectedForm.value = undefined;
  selectedDashboard.value = undefined;

  if (item.type === FormType.Form) {
    selectedForm.value = await formStore.get(item.id);
    return;
  }

  selectedDashboard.value = await dashboardDefService.get<DashboardDef>(item.id);
  dashboardPublishEnabled.value = selectedDashboard.value.memberPublishEnabled || false;
  dashboardTags.value = membersToTags(selectedDashboard.value.publishMembers || []);
}

function finishSelectMembers(tags: ISelectedTag[]) {
  dashboardTags.value = tags;
  showMemberDialog.value = false;
}

async function saveDashboardMembers() {
  if (!selectedDashboard.value) return;
  const request: DashboardDefRequest = {
    id: selectedDashboard.value.id,
    memberPublishEnabled: dashboardPublishEnabled.value,
    publishMembers: tagsToMembers(dashboardTags.value),
  };
  selectedDashboard.value = await dashboardDefService.patch<DashboardDef>(selectedDashboard.value.id, request);
  dashboardTags.value = membersToTags(selectedDashboard.value.publishMembers || []);
  ElMessage.success(t("common.saveSuccess"));
}

function membersToTags(members: Member[]): ISelectedTag[] {
  return members.map((member) => ({
    id: member.id,
    sourceId: member.id,
    label: member.label,
    value: member.code,
    type: convertMemberTypeToTagType(member.type),
    cascadedDept: member.cascadedDept,
  }));
}

function tagsToMembers(tags: ISelectedTag[]): Member[] {
  return tags.map((tag) => ({
    id: tag.sourceId || tag.id,
    code: tag.value,
    label: tag.label,
    type: convertTagTypeToMemberType(tag.type),
    cascadedDept: tag.cascadedDept ?? false,
  }));
}

onBeforeMount(loadItems);
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
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.page-title {
  border-bottom: 1px solid var(--et-border-color-light);
  font-size: var(--et-font-size-16);
  font-weight: 700;
  height: var(--et-size-56);
  line-height: var(--et-size-56);
  padding: 0 var(--et-space-20);
}

.permission-body {
  display: grid;
  flex: 1;
  grid-template-columns: 340px 1fr;
  min-height: 0;
}

.menu-panel {
  border-right: 1px solid var(--et-border-color-light);
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: var(--et-space-16);
}

.config-panel {
  min-width: 0;
  overflow: auto;
  padding: var(--et-space-16);
}

.step-title {
  align-items: center;
  display: flex;
  gap: var(--et-space-8);
  font-weight: 700;
  margin-bottom: var(--et-space-12);

  small {
    color: var(--et-text-secondary);
    font-weight: 400;
  }
}

.menu-scroll {
  flex: 1;
  margin-top: var(--et-space-10);
  min-height: 0;
}

.menu-item {
  align-items: center;
  border-radius: var(--et-radius-6);
  cursor: pointer;
  display: flex;
  gap: var(--et-space-8);
  height: var(--et-size-34);
  padding: 0 var(--et-space-8);

  &.active {
    background: var(--et-bg-primary-soft);
    color: var(--et-color-primary);
    font-weight: 700;
  }

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.dashboard-permission {
  padding: var(--et-space-20) var(--et-space-10);
}

.setting-row {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--et-space-16);
}

.field-label {
  font-weight: 700;
}

.field-tip {
  color: var(--et-text-secondary);
  margin-top: var(--et-space-4);
}

.member-box {
  border: 1px dashed var(--et-border-color);
  min-height: var(--et-size-86);
  padding: var(--et-space-12);
}

.dashboard-actions {
  margin-top: var(--et-space-16);
  text-align: right;
}
</style>
