<template>
  <EtConfirmDialog
    v-model="showDeleteConfirmDialog"
    :title="t('common.message.deleteConfirm_Title')"
    :icon="MessageIcon.Warning"
    :showNoSave="false"
    :okText="t('common.ok')"
    @ok="execDelete"
  >
    <div>{{ t("common.message.deleteConfirm_Content2") }}</div>
  </EtConfirmDialog>
  <et-dialog
    v-model="showAddDialog"
    class="no-foot-divider"
    :title="t('eventFlow.newEventFlowDialog')"
    width="640px"
    destroy-on-close
    @ok="confirmAdd"
  >
    <div class="add-dialog">
      <div class="name-field">
        <div class="label">{{ t("eventFlow.eventFlowName") }}</div>
        <el-input
          v-model="nameDraft"
          :placeholder="t('eventFlow.untitledEventFlow')"
          maxlength="50"
          show-word-limit
        />
      </div>

      <div class="section-label">{{ t("eventFlow.selectTriggerType") }}</div>

      <div
        class="add-item"
        :class="{ active: newEventSource === EventSourceType.Form }"
        @click="newEventSource = EventSourceType.Form"
      >
        <div class="item-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="item-body">
          <div class="title">{{ t("eventFlow.formTrigger") }}</div>
          <div class="desc">{{ t("eventFlow.formTriggerDesc") }}</div>
          <!-- <div v-if="newEventSource === EventSourceType.Form" class="form-selector" @click.stop>
            <el-select
              :model-value="formDef.id"
              disabled
              class="full-width-input"
              :placeholder="t('eventFlow.selectForm')"
            >
              <el-option :label="formDef.name" :value="formDef.id" />
            </el-select>
          </div> -->
        </div>
      </div>

      <div
        class="add-item"
        :class="{ active: newEventSource === EventSourceType.Schedule }"
        @click="newEventSource = EventSourceType.Schedule"
      >
        <div class="item-icon icon-schedule">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="item-body">
          <div class="title">{{ t("eventFlow.scheduleTrigger") }}</div>
          <div class="desc">{{ t("eventFlow.scheduleTriggerDesc") }}</div>
        </div>
      </div>

      <div
        class="add-item"
        :class="{ active: newEventSource === EventSourceType.Http }"
        @click="newEventSource = EventSourceType.Http"
      >
        <div class="item-icon icon-http">
          <el-icon><Link /></el-icon>
        </div>
        <div class="item-body">
          <div class="title">{{ t("eventFlow.httpTrigger") }}</div>
          <div class="desc">{{ t("eventFlow.httpTriggerDesc") }}</div>
        </div>
      </div>
    </div>
  </et-dialog>
  <et-drawer v-model="showDrawer" @close="close">
    <template #title>
      <el-input v-model="selectedFlow!.name" class="title-editor" />
    </template>
    <EventFlowDesigner :appId="formDef.appId" :formId="formDef.id" :flow-def="selectedFlow!" />
  </et-drawer>
  <et-drawer v-model="showLogDrawer">
    <template #title>
      <span>{{ t("eventFlow.executionLog") }}</span>
    </template>
    <EventFlowRunLogView v-if="logFlow" :form-def="formDef" :flow-def="logFlow" />
  </et-drawer>
  <AdvanceLayout
    :title="t('admin.advanced.eventFlow')"
    :desc="
      t('eventFlow.formTriggerDesc') +
      ' / ' +
      t('eventFlow.scheduleTriggerDesc') +
      ' / ' +
      t('eventFlow.httpTriggerDesc')
    "
  >
    <div class="flow-container">
      <div class="panel-header">
        <div class="header-left">
          <el-button type="primary" icon="plus" @click="showAddDialog = true">
            {{ t("eventFlow.newEventFlow") }}
          </el-button>
        </div>
        <div class="header-right"></div>
      </div>
      <div>
        <el-space direction="vertical" class="flow-space">
          <template v-for="flow in eventFlows">
            <et-card class="flow-card" :title="flow.name">
              <template #action>
                <div class="flow-header">
                  <el-button @click="edit(flow)">{{ t("common.edit") }}</el-button>
                  <el-button @click="viewLog(flow)">
                    {{ t("eventFlow.viewExecutionLog") }}
                  </el-button>
                  <el-button class="delete-button" @click="remove(flow)">
                    {{ t("common.delete") }}
                  </el-button>
                  <el-switch
                    :model-value="!flow.disabled"
                    @change="toggleDisable(flow)"
                  ></el-switch>
                </div>
              </template>
              <div class="flow-content">
                {{ t("admin.advanced.triggerPrefix") }}: {{ getTriggerSource(flow) }}
              </div>
            </et-card>
          </template>
        </el-space>
      </div>
    </div>
  </AdvanceLayout>
</template>
<script setup lang="ts">
import EventFlowDesigner from "../../EventFlowDesigner/index.vue";
import EventFlowRunLogView from "./EventFlowRunLogView.vue";
import { FormDef, EventSourceType, WfDefinition, FlowType } from "@eimsnext/models";
import { wfDefinitionService } from "@eimsnext/services";
import { Clock, Document, Link } from "@element-plus/icons-vue";
import { ElMessage, useLocale } from "element-plus";
import buildQuery from "odata-query";
import AdvanceLayout from "./AdvanceLayout.vue";
import { MessageIcon } from "@eimsnext/components";

defineOptions({
  name: "EventFlowList",
});

const { t } = useLocale();

const props = defineProps<{
  formDef: FormDef;
}>();

const showDrawer = ref(false);
const showLogDrawer = ref(false);
const showAddDialog = ref(false);
const showDeleteConfirmDialog = ref(false);
const eventFlows = ref<WfDefinition[]>([]);
const selectedFlow = ref<WfDefinition>();
const logFlow = ref<WfDefinition>();
const newEventSource = ref<EventSourceType>(EventSourceType.Form);
const nameDraft = ref("");

const loadEventFlows = (formId: string) => {
  let query = buildQuery({ filter: { flowType: FlowType.EventFlow, sourceId: formId } });
  wfDefinitionService.query<WfDefinition>(query).then((res) => {
    eventFlows.value = res;
  });

  // formStore.get(formId).then(form => { if (form) formNamesCache.add(formId, form.name) })
};

const getTriggerSource = (flow: WfDefinition) => {
  if (flow.eventSource == EventSourceType.Form) {
    return props.formDef.name;
  }

  if (flow.eventSource == EventSourceType.Http) {
    return t("eventFlow.httpTrigger");
  }

  return t("eventFlow.scheduleTrigger");
};

const addNew = (eventSource: EventSourceType) => {
  selectedFlow.value = {
    id: "",
    appId: props.formDef.appId,
    name: nameDraft.value.trim() || t("eventFlow.untitledEventFlow"),
    flowType: FlowType.EventFlow,
    externalId: "",
    version: 1,
    isCurrent: true,
    released: false,
    content: "",
    eventSource: eventSource,
    sourceId: props.formDef.id,
  };

  showDrawer.value = true;
};

const confirmAdd = () => {
  showAddDialog.value = false;
  addNew(newEventSource.value);
};

watch(showAddDialog, (visible) => {
  if (visible) {
    nameDraft.value = "";
  }
});

const edit = (flow: WfDefinition) => {
  selectedFlow.value = flow;

  showDrawer.value = true;
};

const viewLog = (flow: WfDefinition) => {
  logFlow.value = flow;
  showLogDrawer.value = true;
};

const remove = (flow: WfDefinition) => {
  selectedFlow.value = flow;
  showDeleteConfirmDialog.value = true;
};
const execDelete = () => {
  wfDefinitionService.delete<WfDefinition>(selectedFlow.value!.id).then(() => {
    loadEventFlows(props.formDef.id);
    showDeleteConfirmDialog.value = false;
  });
};
const toggleDisable = (flow: WfDefinition) => {
  if (flow.disabled && hasMissingField(flow)) {
    ElMessage.warning(t("eventFlow.missingFieldEnableBlocked"));
    return;
  }

  wfDefinitionService
    .patch<WfDefinition>(flow.id, { id: flow.id, disabled: !flow.disabled })
    .then(() => {
      flow.disabled = !flow.disabled;
    });
};

const hasMissingField = (flow: WfDefinition) => {
  if (!flow.content) return false;
  try {
    const data = JSON.parse(flow.content);
    return findMissingFlag(data);
  } catch {
    return false;
  }
};

const findMissingFlag = (value: unknown): boolean => {
  if (!value || typeof value !== "object") return false;
  if ((value as { missing?: boolean }).missing) return true;
  if (Array.isArray(value)) return value.some(findMissingFlag);
  return Object.values(value).some(findMissingFlag);
};

function close() {
  showDrawer.value = false;

  loadEventFlows(props.formDef.id);
}

onBeforeMount(() => {
  if (props.formDef) {
    loadEventFlows(props.formDef.id);
  }
});
</script>
<style lang="scss" scoped>
.flow-container {
  display: flex;
  flex-direction: column;

  .panel-header {
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding-bottom: var(--et-space-16);
  }

  .flow-space {
    width: 100%;
    align-items: normal !important;
  }

  .flow-card {
    width: 100%;

    .flow-header {
      display: flex;
      justify-content: space-between;

      .flow-name {
        font-size: var(--et-font-size-15);
        font-weight: 600;
        max-width: 50%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .el-button {
        margin: var(--et-space-0);
        border: none;
      }
    }

    .flow-content {
      display: flex;
      font-size: var(--et-font-size-13);
      padding: var(--et-space-10) var(--et-space-20);
    }
  }
}

.add-dialog {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-14);
  padding: var(--et-space-20);
}

.name-field {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-8);

  .label {
    color: var(--et-text-primary-soft);
    font-weight: 600;
  }
}

.section-label {
  color: var(--et-text-primary-soft);
  font-size: var(--et-font-size-14);
  font-weight: 600;
  margin-top: var(--et-space-8);
}

.add-item {
  align-items: flex-start;
  background: var(--et-bg-container);
  border: 1px solid var(--et-border-color);
  border-radius: var(--et-radius-8);
  cursor: pointer;
  display: flex;
  gap: var(--et-space-12);
  padding: var(--et-space-18) var(--et-space-20);
  transition: border-color var(--et-duration-fast) var(--et-ease-standard);
}

.add-item:hover {
  border-color: var(--et-color-primary-hover);
}

.add-item.active {
  border-color: var(--et-color-primary);
  box-shadow: 0 0 0 1px var(--et-color-primary-outline);
}

.item-icon {
  align-items: center;
  background: var(--et-bg-primary-soft);
  border-radius: var(--et-radius-6);
  color: var(--et-color-primary);
  display: flex;
  flex-shrink: 0;
  height: var(--et-size-36);
  justify-content: center;
  width: var(--et-size-36);

  .el-icon {
    font-size: var(--et-font-size-20);
  }
}

.item-icon.icon-schedule {
  background: var(--et-bg-warning-soft);
  color: var(--et-color-warning);
}

.item-icon.icon-http {
  background: var(--et-bg-success-soft);
  color: var(--et-color-success);
}

.item-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--et-space-4);
}

.add-item .title {
  color: var(--et-text-primary);
  font-size: var(--et-font-size-16);
  font-weight: 600;
}

.add-item .desc {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-13);
  line-height: var(--et-line-height-20);
}

.form-selector {
  margin-top: var(--et-space-8);
}

.full-width-input {
  width: 100%;
}
</style>
