<template>
  <div class="app-admin-page">
    <EtConfirmDialog v-model="showDeleteConfirm" :title="t('admin.appAdmin.deleteConfirmTitle')" :icon="MessageIcon.Warning" :showNoSave="false" @ok="execDelete">
      <div>{{ t("admin.appAdmin.deleteConfirmContent") }}</div>
    </EtConfirmDialog>
    <et-dialog v-model="showAddDialog" :title="t('eventFlow.newEventFlow')" width="620px" @ok="confirmAdd" @cancel="showAddDialog = false">
      <div class="add-form">
        <el-input v-model="nameDraft" :placeholder="t('eventFlow.eventFlowName')" maxlength="50" show-word-limit />
        <el-select v-model="eventSourceDraft" :placeholder="t('eventFlow.triggerType')">
          <el-option :label="t('eventFlow.formTrigger')" :value="EventSourceType.Form" />
          <el-option :label="t('eventFlow.scheduleTrigger')" :value="EventSourceType.Schedule" />
          <el-option :label="t('eventFlow.httpTrigger')" :value="EventSourceType.Http" />
        </el-select>
        <el-select v-model="sourceFormIdDraft" :placeholder="t('admin.appAdmin.sourceForm')">
          <el-option v-for="form in forms" :key="form.id" :label="form.name" :value="form.id" />
        </el-select>
      </div>
    </et-dialog>
    <et-drawer v-model="showDesigner" @close="loadEventFlows">
      <template #title>
        <el-input v-if="selectedFlow" v-model="selectedFlow.name" class="title-editor" />
      </template>
      <EventFlowDesigner v-if="selectedFlow" :app-id="contextStore.appId" :form-id="designerFormId" :flow-def="selectedFlow" />
    </et-drawer>
    <et-drawer v-model="showLog">
      <template #title>{{ t("eventFlow.executionLog") }}</template>
      <EventFlowRunLogView v-if="logFlow && logFormDef" :form-def="logFormDef" :flow-def="logFlow" />
    </et-drawer>

    <div class="page-card">
      <div class="page-title">
        <span>{{ t("admin.advanced.eventFlow") }}</span>
        <div class="title-actions">
          <el-select v-model="triggerFilter" clearable :placeholder="t('eventFlow.triggerType')">
            <el-option :label="t('common.all')" value="" />
            <el-option :label="t('eventFlow.formTrigger')" value="form" />
            <el-option :label="t('eventFlow.scheduleTrigger')" value="schedule" />
            <el-option :label="t('eventFlow.httpTrigger')" value="http" />
          </el-select>
          <el-input v-model="keyword" clearable :placeholder="t('eventFlow.eventFlowName')">
            <template #prefix><et-icon icon="el-search" size="14px" /></template>
          </el-input>
          <el-button type="primary" @click="openAddDialog">{{ t("eventFlow.newEventFlow") }}</el-button>
        </div>
      </div>
      <div class="flow-grid">
        <div v-for="flow in filteredEventFlows" :key="flow.id" class="flow-card">
          <div class="flow-card-title">
            <span>{{ flow.name || t("eventFlow.untitledEventFlow") }}</span>
            <div class="card-actions">
              <el-button link @click="edit(flow)">{{ t("common.edit") }}</el-button>
              <el-button link @click="copy(flow)">{{ t("common.copy") }}</el-button>
              <el-button link type="danger" @click="remove(flow)">{{ t("common.delete") }}</el-button>
            </div>
          </div>
          <div class="flow-card-body">
            <div>{{ t("admin.appAdmin.triggerPrefix") }}</div>
            <strong>{{ triggerText(flow) }}</strong>
            <span>{{ sourceText(flow) }}</span>
          </div>
          <div class="flow-card-footer">
            <el-switch :model-value="!flow.disabled" @change="toggleDisable(flow)" />
            <el-button link type="primary" @click="viewLog(flow)">{{ t("eventFlow.viewExecutionLog") }}</el-button>
          </div>
        </div>
        <el-empty v-if="filteredEventFlows.length === 0" :description="t('admin.appAdmin.emptyEventFlow')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import EventFlowDesigner from "@/components/EventFlowDesigner/index.vue";
import EventFlowRunLogView from "@/components/FormEdit/Advanced/EventFlowRunLogView.vue";
import { EventSourceType, FlowType, FormDef, WfDefinition } from "@eimsnext/models";
import { formDefService, wfDefinitionService } from "@eimsnext/services";
import { useContextStore } from "@eimsnext/store";
import { MessageIcon } from "@eimsnext/components";
import { ElMessage } from "element-plus";
import buildQuery from "odata-query";
import { useI18n } from "vue-i18n";

const contextStore = useContextStore();
const { t } = useI18n();
const eventFlows = ref<WfDefinition[]>([]);
const forms = ref<FormDef[]>([]);
const keyword = ref("");
const showAddDialog = ref(false);
const showDesigner = ref(false);
const showLog = ref(false);
const showDeleteConfirm = ref(false);
const selectedFlow = ref<WfDefinition>();
const logFlow = ref<WfDefinition>();
const nameDraft = ref("");
const eventSourceDraft = ref<EventSourceType>(EventSourceType.Form);
const sourceFormIdDraft = ref("");
const triggerFilter = ref("");

const filteredEventFlows = computed(() => {
  const text = keyword.value.trim().toLowerCase();
  return eventFlows.value.filter((flow) => {
    const matchesText = !text || (flow.name || "").toLowerCase().includes(text);
    const matchesTrigger = !triggerFilter.value || normalizeTrigger(flow) === triggerFilter.value;
    return matchesText && matchesTrigger;
  });
});
const designerFormId = computed(() => selectedFlow.value?.sourceId || sourceFormIdDraft.value || forms.value[0]?.id || "");
const logFormDef = computed(() => forms.value.find((form) => form.id === logFlow.value?.sourceId) || forms.value[0]);

async function loadAll() {
  await Promise.all([loadForms(), loadEventFlows()]);
}

async function loadForms() {
  const query = buildQuery({ filter: { appId: contextStore.appId } });
  forms.value = await formDefService.query<FormDef>(query);
  if (!sourceFormIdDraft.value) {
    sourceFormIdDraft.value = forms.value[0]?.id || "";
  }
}

async function loadEventFlows() {
  const query = buildQuery({
    filter: {
      appId: contextStore.appId,
      flowType: FlowType.EventFlow,
    },
  });
  eventFlows.value = await wfDefinitionService.query<WfDefinition>(query);
}

function openAddDialog() {
  nameDraft.value = "";
  eventSourceDraft.value = EventSourceType.Form;
  sourceFormIdDraft.value = forms.value[0]?.id || "";
  showAddDialog.value = true;
}

function confirmAdd() {
  selectedFlow.value = {
    id: "",
    appId: contextStore.appId,
    name: nameDraft.value.trim() || t("eventFlow.untitledEventFlow"),
    flowType: FlowType.EventFlow,
    externalId: "",
    version: 1,
    isCurrent: true,
    released: false,
    content: "",
    eventSource: eventSourceDraft.value,
    sourceId: sourceFormIdDraft.value,
    disabled: false,
  };
  showAddDialog.value = false;
  showDesigner.value = true;
}

function edit(flow: WfDefinition) {
  selectedFlow.value = { ...flow };
  showDesigner.value = true;
}

async function copy(flow: WfDefinition) {
  const request = {
    ...flow,
    id: "",
    name: `${flow.name || t("eventFlow.untitledEventFlow")}${t("common.copySuffix")}`,
    disabled: true,
  };
  await wfDefinitionService.post<WfDefinition>(request);
  await loadEventFlows();
  ElMessage.success(t("admin.appAdmin.copySuccess"));
}

function remove(flow: WfDefinition) {
  selectedFlow.value = flow;
  showDeleteConfirm.value = true;
}

async function execDelete() {
  if (!selectedFlow.value) return;
  await wfDefinitionService.delete(selectedFlow.value.id);
  showDeleteConfirm.value = false;
  await loadEventFlows();
}

async function toggleDisable(flow: WfDefinition) {
  await wfDefinitionService.patch<WfDefinition>(flow.id, { id: flow.id, disabled: !flow.disabled });
  flow.disabled = !flow.disabled;
}

function viewLog(flow: WfDefinition) {
  logFlow.value = flow;
  showLog.value = true;
}

function triggerText(flow: WfDefinition) {
  if (normalizeTrigger(flow) === "http") return t("eventFlow.httpTrigger");
  if (normalizeTrigger(flow) === "schedule") return t("eventFlow.scheduleTrigger");
  return t("eventFlow.formTrigger");
}

function sourceText(flow: WfDefinition) {
  const form = forms.value.find((item) => item.id === flow.sourceId);
  return form ? form.name : "--";
}

function normalizeTrigger(flow: WfDefinition) {
  if (`${flow.eventSource}` === `${EventSourceType.Http}`) return "http";
  if (`${flow.eventSource}` === `${EventSourceType.Schedule}`) return "schedule";
  return "form";
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
    width: var(--et-size-170);
  }
}

.flow-grid {
  display: grid;
  gap: var(--et-space-16);
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  overflow: auto;
  padding: var(--et-space-20);
}

.flow-card {
  border: 1px solid var(--et-border-color);
  border-radius: var(--et-radius-6);
  min-height: var(--et-size-170);
}

.flow-card-title,
.flow-card-footer {
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: var(--et-size-44);
  padding: 0 var(--et-space-12);
}

.flow-card-title {
  border-bottom: 1px solid var(--et-border-color-light);
  font-weight: 700;
}

.card-actions {
  display: flex;
}

.flow-card-body {
  color: var(--et-text-secondary);
  display: flex;
  flex-direction: column;
  gap: var(--et-space-6);
  min-height: var(--et-size-78);
  padding: var(--et-space-14) var(--et-space-12);

  strong {
    color: var(--et-text-primary);
  }
}

.flow-card-footer {
  border-top: 1px solid var(--et-border-color-light);
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-14);
  padding: var(--et-space-12);
}

.title-editor {
  width: var(--et-size-420);
}
</style>
