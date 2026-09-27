<template>
  <div class="app-admin-page">
    <EtConfirmDialog v-model="showDeleteConfirm" :title="t('admin.appAdmin.deleteConfirmTitle')" :icon="MessageIcon.Warning" :showNoSave="false" @ok="execDelete">
      <div>{{ t("admin.appAdmin.deleteConfirmContent") }}</div>
    </EtConfirmDialog>
    <et-dialog v-model="showAddDialog" :title="t('admin.webhook.new')" width="560px" @ok="confirmAdd" @cancel="showAddDialog = false">
      <div class="add-form">
        <div class="add-form-label">{{ t("admin.appAdmin.form") }}</div>
        <el-select v-model="selectedFormIdDraft" filterable :placeholder="t('admin.appAdmin.selectForm')">
          <el-option v-for="form in forms" :key="form.id" :label="form.name" :value="form.id" />
        </el-select>
      </div>
    </et-dialog>
    <el-drawer v-model="showEditor" class="elt-drawer" direction="btt" size="95%" @close="loadWebhooks">
      <template #header>
        <div class="main-title"><span>{{ t("admin.webhook.title") }}</span></div>
      </template>
      <div class="main-content">
        <WebhookEditor
          v-if="selectedItem && selectedForm"
          v-model="selectedItem"
          :form-def="selectedForm"
          @saved="onSaved"
        />
      </div>
    </el-drawer>
    <el-drawer v-model="showLog" class="elt-drawer" direction="btt" size="95%">
      <template #header>
        <div class="main-title"><span>{{ t("admin.webhook.logTitle") }}</span></div>
      </template>
      <div class="main-content">
        <WebPushLogView v-if="selectedItem" v-model="selectedItem" />
      </div>
    </el-drawer>

    <div class="page-card">
      <div class="page-title">
        <span>{{ t("admin.webhook.title") }}</span>
        <div class="title-actions">
          <el-select v-model="formFilter" clearable :placeholder="t('admin.appAdmin.form')">
            <el-option v-for="form in forms" :key="form.id" :label="form.name" :value="form.id" />
          </el-select>
          <el-input v-model="keyword" clearable :placeholder="t('admin.appAdmin.searchNameOrUrl')">
            <template #prefix><et-icon icon="el-search" size="14px" /></template>
          </el-input>
          <el-button type="primary" @click="openAddDialog">{{ t("admin.webhook.new") }}</el-button>
        </div>
      </div>
      <el-table :data="filteredWebhooks" height="100%" class="webhook-table">
        <el-table-column :label="t('common.name')" min-width="180">
          <template #default="{ row }">{{ row.name || t("admin.appAdmin.untitledWebhook") }}</template>
        </el-table-column>
        <el-table-column :label="t('admin.webhook.serverUrl')" min-width="360" show-overflow-tooltip>
          <template #default="{ row }">{{ row.url }}</template>
        </el-table-column>
        <el-table-column :label="t('admin.appAdmin.form')" min-width="180">
          <template #default="{ row }">{{ formName(row.formId) }}</template>
        </el-table-column>
        <el-table-column :label="t('admin.webhook.trigger')" min-width="260">
          <template #default="{ row }">{{ triggerText(row.triggers) }}</template>
        </el-table-column>
        <el-table-column :label="t('common.remark')" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">{{ row.remark || "--" }}</template>
        </el-table-column>
        <el-table-column :label="t('admin.appAdmin.action')" width="270" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="edit(row)">{{ t("common.edit") }}</el-button>
            <el-button link type="primary" @click="viewLog(row)">{{ t("admin.appAdmin.log") }}</el-button>
            <el-button link type="danger" @click="remove(row)">{{ t("common.delete") }}</el-button>
            <el-switch :model-value="!row.disabled" @change="toggleDisable(row)" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import WebhookEditor from "@/components/FormEdit/Advanced/WebhookEditor.vue";
import WebPushLogView from "@/components/FormEdit/Advanced/WebPushLogView.vue";
import { FormDef, WebHookTrigger, Webhook } from "@eimsnext/models";
import { formDefService, webhookService } from "@eimsnext/services";
import { useContextStore } from "@eimsnext/store";
import { FlagEnum } from "@eimsnext/utils";
import { MessageIcon } from "@eimsnext/components";
import buildQuery from "odata-query";
import { useI18n } from "vue-i18n";

const contextStore = useContextStore();
const { t } = useI18n();
const forms = ref<FormDef[]>([]);
const webhooks = ref<Webhook[]>([]);
const selectedItem = ref<Webhook>();
const showEditor = ref(false);
const showAddDialog = ref(false);
const showLog = ref(false);
const showDeleteConfirm = ref(false);
const keyword = ref("");
const formFilter = ref("");
const selectedFormIdDraft = ref("");

const selectedForm = computed(() => forms.value.find((form) => form.id === selectedItem.value?.formId));
const filteredWebhooks = computed(() => {
  const text = keyword.value.trim().toLowerCase();
  return webhooks.value.filter((item) => {
    const matchesForm = !formFilter.value || item.formId === formFilter.value;
    const matchesText = !text || (item.name || "").toLowerCase().includes(text) || item.url.toLowerCase().includes(text);
    return matchesForm && matchesText;
  });
});

async function loadAll() {
  await Promise.all([loadForms(), loadWebhooks()]);
}

async function loadForms() {
  forms.value = await formDefService.query<FormDef>(buildQuery({ filter: { appId: contextStore.appId } }));
}

async function loadWebhooks() {
  webhooks.value = await webhookService.query<Webhook>(buildQuery({ filter: { appId: contextStore.appId } }));
}

function addNew() {
  if (!selectedFormIdDraft.value) {
    ElMessage.warning(t("admin.appAdmin.createFormFirst"));
    return;
  }

  selectedItem.value = {
    id: "",
    appId: contextStore.appId,
    formId: selectedFormIdDraft.value,
    name: "",
    url: "",
    secret: "",
    remark: "",
    triggers: WebHookTrigger.Data_Created | WebHookTrigger.Data_Updated | WebHookTrigger.Data_Removed,
    disabled: false,
  };
  showEditor.value = true;
}

function openAddDialog() {
  if (forms.value.length === 0) {
    ElMessage.warning(t("admin.appAdmin.createFormFirst"));
    return;
  }

  selectedFormIdDraft.value = formFilter.value || forms.value[0].id;
  showAddDialog.value = true;
}

function confirmAdd() {
  showAddDialog.value = false;
  addNew();
}

function edit(hook: Webhook) {
  selectedItem.value = { ...hook };
  showEditor.value = true;
}

function viewLog(hook: Webhook) {
  selectedItem.value = hook;
  showLog.value = true;
}

function onSaved(hook: Webhook) {
  selectedItem.value = hook;
  loadWebhooks();
}

function remove(hook: Webhook) {
  selectedItem.value = hook;
  showDeleteConfirm.value = true;
}

async function execDelete() {
  if (!selectedItem.value) return;
  await webhookService.delete(selectedItem.value.id);
  showDeleteConfirm.value = false;
  await loadWebhooks();
}

async function toggleDisable(hook: Webhook) {
  await webhookService.patch<Webhook>(hook.id, { id: hook.id, disabled: !hook.disabled });
  hook.disabled = !hook.disabled;
}

function formName(formId: string) {
  return forms.value.find((form) => form.id === formId)?.name || "--";
}

function triggerText(value?: WebHookTrigger) {
  const triggers = value || WebHookTrigger.NotSet;
  const labels: string[] = [];
  if (FlagEnum.has(triggers, WebHookTrigger.Data_Created)) labels.push(t("admin.data_created"));
  if (FlagEnum.has(triggers, WebHookTrigger.Data_Updated)) labels.push(t("admin.data_updated"));
  if (FlagEnum.has(triggers, WebHookTrigger.Data_Removed)) labels.push(t("admin.data_removed"));
  if (FlagEnum.has(triggers, WebHookTrigger.WfStatus_Updated)) labels.push(t("admin.wfstatus_updated"));
  if (FlagEnum.has(triggers, WebHookTrigger.WfTask_Updated)) labels.push(t("admin.wftask_updated"));
  return labels.join(t("common.listSeparator")) || "--";
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

.title-actions {
  align-items: center;
  display: flex;
  gap: var(--et-space-10);

  .el-input {
    width: var(--et-size-260);
  }

  .el-select {
    width: var(--et-size-220);
  }
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-10);
  padding: var(--et-space-12);
}

.add-form-label {
  color: var(--et-text-secondary);
  font-weight: 600;
}

.webhook-table {
  flex: 1;
}

.main-content {
  height: 100%;
}
</style>
