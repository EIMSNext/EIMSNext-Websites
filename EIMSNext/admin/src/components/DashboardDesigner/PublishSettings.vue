<template>
  <div class="dashboard-settings-page">
    <section class="settings-card">
      <div class="settings-card__header">
        <strong>{{ t("admin.publishEditor.publishToMembers") }}</strong>
      </div>
      <div class="settings-card__body">
        <div class="setting-row">
          <div>
            <div class="field-label">{{ t("admin.dashboard.viewDashboard") }}</div>
            <SelectedTags v-model="publishTags" :editable="true" class="member-box" @editTag="showMemberDialog = true" />
          </div>
          <el-switch v-model="localDash.memberPublishEnabled" @change="saveDashboard" />
        </div>
      </div>
    </section>

    <section class="settings-card">
      <div class="settings-card__body compact">
        <div class="setting-row">
          <div>
            <div class="field-label">{{ t("admin.dashboard.setAsHome") }}</div>
          </div>
          <el-switch v-model="isHomeEntry" @change="saveHomeEntry" />
        </div>
      </div>
    </section>

    <section class="settings-card">
      <div class="settings-card__header">
        <strong>{{ t("admin.publish.public") }}</strong>
        <span>{{ t("admin.dashboard.publicPublishDesc") }}</span>
      </div>
      <div class="settings-card__body">
        <el-switch v-model="localDash.publicEnabled" @change="saveDashboard" />
        <div v-if="localDash.publicEnabled" class="public-links">
          <div class="field-label">{{ t("admin.dashboard.visitLink") }}</div>
          <el-input :model-value="publicUrl" readonly>
            <template #append>
              <el-button @click="copy(publicUrl)">{{ t("common.copy") }}</el-button>
              <el-button @click="openPublicUrl">{{ t("shareLinkBar.open") }}</el-button>
              <el-button @click="showEmbedDialog = true">{{ t("admin.dashboard.embedPage") }}</el-button>
            </template>
          </el-input>
        </div>
      </div>
    </section>

    <MemberSelectDialog
      v-model="showMemberDialog"
      :tags="publishTags"
      :member-options="memberOptions"
      @ok="finishSelectPublishMembers"
    />

    <et-dialog v-model="showEmbedDialog" :title="t('admin.dashboard.embedPage')" width="700px">
      <div class="embed-dialog">
        <div class="field-tip">{{ t("admin.dashboard.embedPageDesc") }}</div>
        <div class="field-label">{{ t("admin.dashboard.embedLink") }}</div>
        <el-input :model-value="publicUrl" readonly>
          <template #append><el-button @click="copy(publicUrl)">{{ t("common.copy") }}</el-button></template>
        </el-input>
        <div class="field-label mt">{{ t("admin.dashboard.sampleCode") }}</div>
        <el-input :model-value="embedCode" readonly>
          <template #append><el-button @click="copy(embedCode)">{{ t("common.copy") }}</el-button></template>
        </el-input>
      </div>
    </et-dialog>
  </div>
</template>

<script setup lang="ts">
import { AppDef, DashboardDef, Member, MemberType } from "@eimsnext/models";
import { ISelectedTag, MemberSelectDialog, MemberTabs, SelectedTags } from "@eimsnext/components";
import { appDefService, dashboardDefService } from "@eimsnext/services";
import { useAppStore, useContextStore } from "@eimsnext/store";
import { DataItemType } from "@eimsnext/components/src/common";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  dashDef: DashboardDef;
}>();

const emit = defineEmits<{
  (e: "updated", value: DashboardDef): void;
}>();

const contextStore = useContextStore();
const appStore = useAppStore();
const { t } = useI18n();
const localDash = ref<DashboardDef>({ ...props.dashDef });
const app = ref<AppDef>();
const publishTags = ref<ISelectedTag[]>([]);
const showMemberDialog = ref(false);
const showEmbedDialog = ref(false);

const memberOptions = {
  showTabs: MemberTabs.Department | MemberTabs.Role | MemberTabs.Employee,
  cascadedDept: true,
  showCascade: true,
};

const isHomeEntry = ref(false);

const publicUrl = computed(() => {
  const token = localDash.value.publicToken || "";
  return `${window.location.origin}${window.location.pathname}#/dash/public/${token}`;
});
const embedCode = computed(() => `<iframe width="100%" height="100%" style="border: none;" src="${publicUrl.value}"></iframe>`);

watch(
  () => props.dashDef,
  (value) => {
    localDash.value = { ...value };
    publishTags.value = membersToTags(value.publishMembers || []);
    loadApp();
  },
  { immediate: true },
);

async function loadApp() {
  app.value = await appStore.get(props.dashDef.appId, false);
  isHomeEntry.value = app.value?.homeEntryIds?.includes(props.dashDef.id) || false;
}

async function saveDashboard() {
  const updated = await dashboardDefService.patch<DashboardDef>(localDash.value.id, {
    id: localDash.value.id,
    memberPublishEnabled: localDash.value.memberPublishEnabled,
    publishMembers: tagsToMembers(publishTags.value),
    publicEnabled: localDash.value.publicEnabled,
    publicToken: localDash.value.publicToken,
  });
  localDash.value = updated;
  publishTags.value = membersToTags(updated.publishMembers || []);
  emit("updated", updated);
  ElMessage.success(t("common.saveSuccess"));
}

async function saveHomeEntry(value: string | number | boolean) {
  if (!app.value) return;

  const entryIds = app.value.homeEntryIds || [];
  const nextIds = Boolean(value)
    ? Array.from(new Set([...entryIds, props.dashDef.id]))
    : entryIds.filter((id) => id !== props.dashDef.id);
  const updated = await appDefService.patch<AppDef>(app.value.id, {
    id: app.value.id,
    homeEntryIds: nextIds,
  });
  app.value = updated;
  isHomeEntry.value = updated.homeEntryIds?.includes(props.dashDef.id) || false;
  appStore.update(updated);
  contextStore.setAppChanged();
  ElMessage.success(t("common.saveSuccess"));
}

function finishSelectPublishMembers(tags: ISelectedTag[]) {
  publishTags.value = tags;
  showMemberDialog.value = false;
  saveDashboard();
}

async function copy(text: string) {
  await navigator.clipboard.writeText(text);
  ElMessage.success(t("triggerNodeMeta.copied"));
}

function openPublicUrl() {
  window.open(publicUrl.value, "_blank");
}

function membersToTags(members: Member[]): ISelectedTag[] {
  return members.map((member) => ({
    id: member.id,
    sourceId: member.id,
    label: member.label,
    value: member.code,
    type: memberTypeToDataItemType(member.type),
    cascadedDept: member.cascadedDept,
  }));
}

function tagsToMembers(tags: ISelectedTag[]): Member[] {
  return tags.map((tag) => ({
    id: tag.sourceId || tag.id,
    code: tag.value,
    label: tag.label,
    type: dataItemTypeToMemberType(tag.type),
    cascadedDept: tag.cascadedDept ?? false,
  }));
}

function memberTypeToDataItemType(type: MemberType): DataItemType {
  if (type === MemberType.Department) return DataItemType.Department;
  if (type === MemberType.Role) return DataItemType.Role;
  if (type === MemberType.Employee) return DataItemType.Employee;
  return DataItemType.Unknown;
}

function dataItemTypeToMemberType(type: DataItemType): MemberType {
  if (type === DataItemType.Department) return MemberType.Department;
  if (type === DataItemType.Role) return MemberType.Role;
  if (type === DataItemType.Employee) return MemberType.Employee;
  return MemberType.None;
}
</script>

<style scoped lang="scss">
.dashboard-settings-page {
  background: var(--et-bg-page);
  height: 100%;
  overflow: auto;
  padding: var(--et-space-20) 0;
}

.settings-card {
  background: var(--et-bg-container);
  border: 1px solid var(--et-border-color-light);
  box-shadow: var(--et-shadow-light);
  margin: 0 auto var(--et-space-16);
  width: 820px;
}

.settings-card__header {
  align-items: center;
  border-bottom: 1px solid var(--et-border-color-light);
  display: flex;
  gap: var(--et-space-8);
  min-height: var(--et-size-48);
  padding: 0 var(--et-space-20);

  span {
    color: var(--et-text-secondary);
    font-size: var(--et-font-size-13);
  }
}

.settings-card__body {
  padding: var(--et-space-20);

  &.compact {
    padding: var(--et-space-20);
  }
}

.setting-row {
  align-items: flex-start;
  display: flex;
  gap: var(--et-space-16);
  justify-content: space-between;
}

.field-label {
  color: var(--et-text-primary);
  font-weight: 600;
  margin-bottom: var(--et-space-8);
}

.field-tip {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-12);
}

.member-box {
  border: 1px dashed var(--et-border-color);
  min-height: var(--et-size-86);
  padding: var(--et-space-12);
  width: 560px;
}

.public-links {
  margin-top: var(--et-space-14);
  width: 560px;
}

.embed-dialog {
  padding: 0 var(--et-space-16) var(--et-space-16);

  .mt {
    margin-top: var(--et-space-14);
  }
}
</style>
