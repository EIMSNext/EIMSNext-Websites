<template>
  <div class="app-admin-page">
    <div class="page-card">
      <div class="page-title">
        <span>{{ t("admin.appAdmin.crossBinding") }}</span>
        <el-button type="primary" :disabled="!selectedAppId" :loading="saving" @click="saveBindings">{{ t("common.save") }}</el-button>
      </div>
      <div class="selected-panel">
        <div class="section-title">{{ t("admin.appAdmin.selectedTitle") }}</div>
        <div v-if="selectedForms.length === 0" class="empty-text">{{ t("admin.appAdmin.emptySelected") }}</div>
        <div v-else class="selected-tags">
          <el-tag v-for="form in selectedForms" :key="form.id" effect="plain">
            {{ form.name }}
          </el-tag>
        </div>
      </div>
      <div class="binding-body">
        <div class="app-list">
          <el-input v-model="appKeyword" clearable :placeholder="t('admin.appAdmin.searchApps')">
            <template #prefix><et-icon icon="el-search" size="14px" /></template>
          </el-input>
          <el-scrollbar class="list-scroll">
            <div
              v-for="item in filteredApps"
              :key="item.id"
              class="app-item"
              :class="{ active: selectedAppId === item.id }"
              @click="selectApp(item.id)"
            >
              <AppIcon :app="item" icon-size="14px" class="app-item-icon" />
              <span>{{ item.name }}</span>
            </div>
          </el-scrollbar>
        </div>
        <div class="form-list">
          <el-input v-model="formKeyword" clearable :placeholder="t('admin.appAdmin.searchForms')">
            <template #prefix><et-icon icon="el-search" size="14px" /></template>
          </el-input>
          <el-scrollbar class="list-scroll">
            <div v-if="!selectedAppId" class="empty-text">{{ t("admin.appAdmin.selectSourceApp") }}</div>
            <el-checkbox-group v-else v-model="checkedFormIds" class="checkbox-list">
              <el-checkbox v-for="form in filteredForms" :key="form.id" :label="form.id">
                <span class="form-title">{{ form.name }}</span>
              </el-checkbox>
            </el-checkbox-group>
          </el-scrollbar>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AppDef, CrossBinding, FormDef } from "@eimsnext/models";
import { appDefService, crossBindingService, formDefService } from "@eimsnext/services";
import { useContextStore, useFormStore } from "@eimsnext/store";
import { ElMessage, ElMessageBox } from "element-plus";
import buildQuery from "odata-query";
import { useI18n } from "vue-i18n";

type BindingForm = FormDef & { bound?: boolean };

const contextStore = useContextStore();
const formStore = useFormStore();
const { t } = useI18n();
const apps = ref<AppDef[]>([]);
const forms = ref<BindingForm[]>([]);
const bindings = ref<CrossBinding[]>([]);
const selectedForms = ref<FormDef[]>([]);
const selectedAppId = ref("");
const checkedFormIds = ref<string[]>([]);
const initialCheckedFormIds = ref<string[]>([]);
const appKeyword = ref("");
const formKeyword = ref("");
const saving = ref(false);

const filteredApps = computed(() => {
  const keyword = appKeyword.value.trim().toLowerCase();
  if (!keyword) return apps.value;
  return apps.value.filter((item) => item.name.toLowerCase().includes(keyword));
});

const filteredForms = computed(() => {
  const keyword = formKeyword.value.trim().toLowerCase();
  if (!keyword) return forms.value;
  return forms.value.filter((item) => item.name.toLowerCase().includes(keyword));
});

const hasUnsavedChanges = computed(() => !isSameIdList(checkedFormIds.value, initialCheckedFormIds.value));

async function loadAll() {
  await Promise.all([loadApps(), loadSelectedForms()]);
  if (!selectedAppId.value && apps.value.length > 0) {
    await loadSourceAppForms(apps.value[0].id);
  }
}

async function loadApps() {
  const visibleApps = await appDefService.query<AppDef>();
  apps.value = visibleApps
    .filter((item) => item.id !== contextStore.appId)
    .sort((left, right) => {
      const sortCompare = (left.sortIndex || 0) - (right.sortIndex || 0);
      if (sortCompare !== 0) {
        return sortCompare;
      }
      return (left.name || "").localeCompare(right.name || "", "zh-CN");
    });
}

async function loadSelectedForms(force = false) {
  const allForms = force
    ? await formStore.loadFormsIncludeCross(contextStore.appId, true)
    : await formDefService.getFormsIncludeCross(contextStore.appId);
  selectedForms.value = allForms.filter((item) => item.external);
}

async function selectApp(appId: string) {
  if (appId === selectedAppId.value) return;
  if (!(await confirmDiscardChanges())) return;
  await loadSourceAppForms(appId);
}

async function loadSourceAppForms(appId: string) {
  selectedAppId.value = appId;
  formKeyword.value = "";
  const sourceApp = apps.value.find((item) => item.id === appId);
  if (!sourceApp) {
    bindings.value = [];
    forms.value = [];
    checkedFormIds.value = [];
    initialCheckedFormIds.value = [];
    return;
  }

  const [sourceForms, sourceBindings] = await Promise.all([
    formDefService.query<FormDef>(buildSourceFormsQuery(appId)),
    crossBindingService.query<CrossBinding>(buildQuery({ filter: { targetAppId: contextStore.appId, sourceAppId: appId } })),
  ]);

  bindings.value = sourceBindings;
  const boundFormIds = new Set(sourceBindings.map((item) => item.sourceFormId));

  forms.value = sourceForms
    .map((form) => ({
      ...form,
      bound: boundFormIds.has(form.id),
      external: true,
    }))
    .sort((left, right) => left.name.localeCompare(right.name, "zh-CN"));

  checkedFormIds.value = forms.value.filter((item) => item.bound).map((item) => item.id);
  initialCheckedFormIds.value = [...checkedFormIds.value];
}

async function saveBindings() {
  if (!selectedAppId.value) return;
  saving.value = true;
  try {
    const selectedSet = new Set(checkedFormIds.value);
    const currentBindings = bindings.value.filter((item) => item.sourceAppId === selectedAppId.value);
    const addFormIds = checkedFormIds.value.filter((formId) => !currentBindings.some((item) => item.sourceFormId === formId));
    const removeBindingIds = currentBindings
      .filter((item) => !selectedSet.has(item.sourceFormId))
      .map((item) => item.id);

    await Promise.all([
      ...addFormIds.map((sourceFormId) =>
        crossBindingService.post<CrossBinding>({
          id: "",
          targetAppId: contextStore.appId,
          sourceAppId: selectedAppId.value,
          sourceFormId,
        }),
      ),
      ...removeBindingIds.map((id) => crossBindingService.delete<void>(id)),
    ]);

    await Promise.all([loadSourceAppForms(selectedAppId.value), loadSelectedForms(true)]);
    ElMessage.success(t("common.saveSuccess"));
  } finally {
    saving.value = false;
  }
}

function buildSourceFormsQuery(appId: string) {
  const query = buildQuery({ filter: { appId } });
  return `${query}&appid=${encodeURIComponent(appId)}`;
}

function isSameIdList(left: string[], right: string[]) {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return left.every((id) => rightSet.has(id));
}

async function confirmDiscardChanges() {
  if (!hasUnsavedChanges.value) return true;
  try {
    await ElMessageBox.confirm(
      t("admin.appAdmin.unsavedCrossBindingContent"),
      t("admin.appAdmin.unsavedCrossBindingTitle"),
      {
        confirmButtonText: t("common.confirm"),
        cancelButtonText: t("common.cancel"),
        type: "warning",
      },
    );
    return true;
  } catch {
    return false;
  }
}

onBeforeMount(loadAll);
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
  align-items: center;
  border-bottom: 1px solid var(--et-border-color-light);
  display: flex;
  font-size: var(--et-font-size-16);
  font-weight: 700;
  height: var(--et-size-56);
  justify-content: space-between;
  padding: 0 var(--et-space-20);
}

.selected-panel {
  border-bottom: 1px solid var(--et-border-color-light);
  padding: var(--et-space-14) var(--et-space-20);
}

.section-title {
  color: var(--et-text-primary);
  font-weight: 700;
  margin-bottom: var(--et-space-10);
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--et-space-8);
}

.empty-text {
  color: var(--et-text-tertiary);
  padding: var(--et-space-16);
  text-align: center;
}

.binding-body {
  display: grid;
  flex: 1;
  grid-template-columns: 1fr 1fr;
  min-height: 0;
}

.app-list,
.form-list {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: var(--et-space-16);
}

.app-list {
  border-right: 1px solid var(--et-border-color-light);
}

.list-scroll {
  flex: 1;
  margin-top: var(--et-space-12);
  min-height: 0;
}

.app-item {
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

.app-item-icon {
  height: var(--et-size-22);
  width: var(--et-size-22);
}

.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-8);
}

.form-title {
  display: inline-block;
  max-width: 520px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  white-space: nowrap;
}
</style>
