<template>
  <template v-if="triggerKind === EventFlowTriggerKind.Form">
    <MetaItemHeader :label="t('eventFlow.triggeringForm')" :required="true" />
    <div class="section-indent">
      <el-input v-model="formName" readonly size="default" class="full-width-input" />
    </div>
    <MetaItemHeader class="mt-[8px]" :label="t('eventFlow.trigger')" :required="true" />
    <div class="trigger-header ml-[8px]">
      <el-popover popper-class="data-triggers" placement="bottom" :show-arrow="false" width="200" trigger="click">
        <div class="trigger-header">
          <div class="add-trigger" :class="{ notAllow: triggerBySubmit }" @click="addTrigger(EventType.Submitted)">
            {{ t("eventFlow.addedRecord") }}
          </div>
          <template v-if="!usingFlow">
            <div class="add-trigger" :class="{ notAllow: triggerByUpdate }" @click="addTrigger(EventType.Modified)">
              {{ t("eventFlow.updatedRecord") }}
            </div>
            <div class="add-trigger" :class="{ notAllow: triggerByDelete }" @click="addTrigger(EventType.Removed)">
              {{ t("eventFlow.deletedRecord") }}
            </div>
          </template>
          <template v-if="usingFlow">
            <div class="add-trigger" :class="{ notAllow: triggerByApproved }" @click="addTrigger(EventType.Approved)">
              {{ t("eventFlow.wfApproved") }}
            </div>
            <div class="add-trigger" :class="{ notAllow: triggerByRejected }" @click="addTrigger(EventType.Rejected)">
              {{ t("eventFlow.wfRejected") }}
            </div>
            <div class="add-trigger" :class="{ notAllow: triggerByApproving }" @click="addTrigger(EventType.Approving)">
              {{ t("eventFlow.wfNextNode") }}
            </div>
          </template>
        </div>
        <template #reference>
          <el-button class="btn-add-trigger">{{ "+ " + t("eventFlow.addTrigger") }}</el-button>
        </template>
      </el-popover>
      <div class="item-triggers">
        <template v-for="(item, index) in triggerList" :key="item.id">
          <div class="show-triggers">
            <div class="color-838892">{{ index == 0 ? t("eventFlow.when") : t("eventFlow.or") }}</div>
            <template v-if="item.id == EventType.Approving">
              <div class="trigger-approving-content">
                <div>{{ t("eventFlow.wfNextNode") }}</div>
                <div class="trigger-node-select-wrap">
                  <el-select v-model="wfNodeId" :placeholder="t('eventFlow.selectNode')" size="default" class="trigger-node-select" @change="onNodeInput">
                    <el-option v-for="item in nodeList" :key="item.id" :label="item.label" :value="item.id" />
                  </el-select>
                </div>
                <el-select v-model="nodeAction" size="default" class="trigger-action-select" @change="onActionInput">
                  <el-option v-for="item in actionList" :key="item.id" :label="item.label" :value="item.id" />
                </el-select>
              </div>
            </template>
            <template v-else>
              <div class="trigger-label">{{ t(item.title) }}</div>
            </template>
            <div class="trigger-delete" @click="delTrigger(item.id)">
              <et-icon icon="el-delete" class="btn-delete-trigger"></et-icon>
            </div>
          </div>
        </template>
      </div>
    </div>
    <MetaItemHeader class="mt-[12px]" :label="t('eventFlow.triggerCondition')" :required="true" />
    <ConditionList v-model="condList" :formId="flowContext!.formId" @change="onCondInput" @remove="onCondClear" />
  </template>

  <template v-else-if="triggerKind === EventFlowTriggerKind.Schedule">
    <MetaItemHeader :label="t('eventFlow.triggerTime')" :required="true" />
    <TriggerTimeSettings v-model="scheduleValue" :field-options="availableTimeFields" :allow-mode-switch="true" class="section-indent" />
    <MetaItemHeader v-if="showScheduleCondition" class="mt-[12px]" :label="t('eventFlow.triggerCondition')" :required="true" />
    <ConditionList v-if="showScheduleCondition" v-model="condList" :formId="flowContext!.formId" @change="onCondInput" @remove="onCondClear" />
    <div v-else class="section-indent muted-text">{{ t("eventFlow.noTriggerData") }}</div>
  </template>

  <template v-else>
    <MetaItemHeader :label="t('eventFlow.triggerAddress')" :required="true" />
    <div class="section-indent">
      <el-input :model-value="hookUrl" readonly class="full-width-input">
        <template #append>
          <el-button @click="copyHookUrl">{{ t("common.copy") }}</el-button>
        </template>
      </el-input>
    </div>
    <MetaItemHeader class="mt-[12px]" :label="t('eventFlow.triggerConfig')" :required="false" />
    <div class="section-indent http-config">
      <el-checkbox v-model="enableIpLimit">{{ t("eventFlow.allowedIps") }}</el-checkbox>
      <el-input
        v-if="enableIpLimit"
        v-model="allowedIpText"
        type="textarea"
        :rows="3"
        :placeholder="t('comp.triggerNodeMeta.oneIpPerLine')"
        @change="syncAllowedIps"
      />
      <el-checkbox v-model="enableCustomResponse">{{ t("eventFlow.responseContent") }}</el-checkbox>
      <div v-if="enableCustomResponse" class="response-config">
        <el-input-number v-model="responseStatusCode" :min="200" :max="599" @change="syncHttpSettings" />
        <el-input v-model="responseContentType" placeholder="Content-Type" @change="syncHttpSettings" />
        <el-input v-model="responseBody" type="textarea" :rows="4" :placeholder="t('comp.triggerNodeMeta.responseBodyPlaceholder')" @change="syncHttpSettings" />
      </div>
    </div>
    <MetaItemHeader class="mt-[12px]" :label="t('eventFlow.sampleFields')" :required="false" />
    <div class="section-indent http-config">
      <el-button type="primary" @click="openSampleDialog">{{ t("eventFlow.fetchSampleData") }}</el-button>
      <el-table :data="httpFields" size="small" border class="http-table">
        <el-table-column prop="label" :label="t('comp.triggerNodeMeta.fieldName')" min-width="180" />
        <el-table-column prop="type" :label="t('comp.triggerNodeMeta.fieldType')" width="120" />
        <el-table-column prop="sampleValue" :label="t('comp.triggerNodeMeta.sampleValue')" min-width="220" show-overflow-tooltip />
      </el-table>
    </div>
  </template>

  <HttpSampleDialog
    v-model="showSampleDialog"
    :event-flow-id="flowContext.definitionId"
    :corp-id="corpId"
    :hook-url="hookUrl"
    @captured="onHttpSampleCaptured"
  />
</template>
<script lang="ts" setup>
import { computed, inject, onBeforeMount, ref } from "vue";
import {
  IFlowData,
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  EventType,
} from "../Common/FlowData";
import {
  EventFlowScheduleSourceType,
  EventFlowTriggerKind,
  FieldType,
  FormDef,
  TimerOffsetDirection,
  TimerOffsetUnit,
  TimerRepeatType,
  WfDefinition,
} from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import { FlagEnum, uniqueId } from "@eimsnext/utils";
import { EventFlowHttpSampleResult, wfDefinitionService } from "@eimsnext/services";
import buildQuery from "odata-query";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { buildWfNodeListItems } from "./type";
import MetaItemHeader from "../Common/MetaItemHeader.vue";
import { IConditionList } from "@/ConditionList/type";
import { IListItem } from "@/list/type";
import { DataItemType } from "@/common";
import {
  TriggerTimeFieldOption,
  TriggerTimeMode,
  TriggerTimeSettings,
  TriggerTimeSettingsValue,
} from "../../TriggerTimeSettings";
import HttpSampleDialog from "./HttpSampleDialog.vue";
const { t } = useI18n();

defineOptions({
  name: "TriggerNodeMeta",
});

const formStore = useFormStore();
const formRef = ref<FormDef>();
const formName = ref("");
const usingFlow = ref(false);
const selectedTriggers = ref(0);
const flowContext = inject<IFlowContext>("flowContext")!;
const activeData = ref<IFlowNodeData>(flowContext.activeData);
const condList = ref<IConditionList>({ id: uniqueId(), rel: "and", items: [] });
const wfFlowData = ref<IFlowData>();
const wfNodeId = ref("");
const nodeAction = ref("submit");
const nodeList = ref<IListItem[]>([]);
const allowedIpText = ref("");
const showSampleDialog = ref(false);
const corpId = computed(() => (flowContext as any).corpId || "");
const actionList = computed<IListItem[]>(() => [
  {
    id: "submit",
    label: t("eventFlow.wfAction_Submit"),
    type: DataItemType.Unknown,
  },
  // { id: "return", label: t("eventFlow.wfAction_Return") },
]);

const triggerKind = computed(() => activeData.value.metadata.triggerMeta?.triggerKind ?? EventFlowTriggerKind.Form);
const availableTimeFields = computed<TriggerTimeFieldOption[]>(() => formRef.value ? buildNotifyTimeFieldOptions(formRef.value) : []);
const showScheduleCondition = computed(() => scheduleValue.value.mode === TriggerTimeMode.Field);
const httpFields = computed(() => activeData.value.metadata.triggerMeta?.httpSettings?.sampleFields ?? []);
const hookUrl = computed(() => {
  const eventFlowId = flowContext.definitionId || "{eventFlowId}";
  return `/api/v1/tenant/{corpId}/eventflow/${eventFlowId}`;
});
const enableIpLimit = computed({
  get: () => (activeData.value.metadata.triggerMeta?.httpSettings?.allowedIps?.length ?? 0) > 0,
  set: (value: boolean) => {
    if (!activeData.value.metadata.triggerMeta?.httpSettings) return;
    activeData.value.metadata.triggerMeta.httpSettings.allowedIps = value ? parseIpText(allowedIpText.value) : [];
  },
});
const enableCustomResponse = computed({
  get: () => !!activeData.value.metadata.triggerMeta?.httpSettings?.responseEnabled,
  set: (value: boolean) => {
    if (!activeData.value.metadata.triggerMeta?.httpSettings) return;
    activeData.value.metadata.triggerMeta.httpSettings.responseEnabled = value;
  },
});
const responseStatusCode = computed({
  get: () => activeData.value.metadata.triggerMeta?.httpSettings?.responseStatusCode ?? 200,
  set: (value: number) => {
    if (!activeData.value.metadata.triggerMeta?.httpSettings) return;
    activeData.value.metadata.triggerMeta.httpSettings.responseStatusCode = value;
  },
});
const responseContentType = computed({
  get: () => activeData.value.metadata.triggerMeta?.httpSettings?.responseContentType ?? "application/json",
  set: (value: string) => {
    if (!activeData.value.metadata.triggerMeta?.httpSettings) return;
    activeData.value.metadata.triggerMeta.httpSettings.responseContentType = value;
  },
});
const responseBody = computed({
  get: () => activeData.value.metadata.triggerMeta?.httpSettings?.responseBody ?? "",
  set: (value: string) => {
    if (!activeData.value.metadata.triggerMeta?.httpSettings) return;
    activeData.value.metadata.triggerMeta.httpSettings.responseBody = value;
  },
});

const scheduleValue = computed<TriggerTimeSettingsValue>({
  get: () => {
    const timeSettings = activeData.value.metadata.triggerMeta?.timeSettings;
    return {
      mode: timeSettings?.sourceType === EventFlowScheduleSourceType.FormField ? TriggerTimeMode.Field : TriggerTimeMode.Custom,
      repeatType: timeSettings?.repeatType ?? TimerRepeatType.Once,
      repeatConfig: timeSettings?.repeatConfig,
      custom: {
        startTime: timeSettings?.startTime,
        endTime: timeSettings?.sourceType === EventFlowScheduleSourceType.Custom ? timeSettings?.endTime : undefined,
      },
      field: {
        timeField: timeSettings?.timeField,
        fieldFormat: timeSettings?.fieldFormat,
        direction: timeSettings?.direction ?? TimerOffsetDirection.At,
        fixedTime: timeSettings?.fixedTime || "09:00",
        offsetValue: timeSettings?.offsetValue ?? 1,
        offsetUnit: timeSettings?.offsetUnit ?? TimerOffsetUnit.Minute,
        endTime: timeSettings?.sourceType === EventFlowScheduleSourceType.FormField ? timeSettings?.endTime : undefined,
      },
    };
  },
  set: (value) => {
    if (!activeData.value.metadata.triggerMeta) return;
    activeData.value.metadata.triggerMeta.timeSettings = {
      sourceType: value.mode === TriggerTimeMode.Field ? EventFlowScheduleSourceType.FormField : EventFlowScheduleSourceType.Custom,
      startTime: value.mode === TriggerTimeMode.Custom ? value.custom?.startTime : undefined,
      endTime: value.mode === TriggerTimeMode.Custom ? value.custom?.endTime : value.field?.endTime,
      timeField: value.mode === TriggerTimeMode.Field ? value.field?.timeField : undefined,
      fieldFormat: value.mode === TriggerTimeMode.Field ? value.field?.fieldFormat : undefined,
      direction: value.mode === TriggerTimeMode.Field ? value.field?.direction ?? TimerOffsetDirection.At : TimerOffsetDirection.At,
      fixedTime: value.mode === TriggerTimeMode.Field ? value.field?.fixedTime : undefined,
      offsetValue: value.mode === TriggerTimeMode.Field ? value.field?.offsetValue : undefined,
      offsetUnit: value.mode === TriggerTimeMode.Field ? value.field?.offsetUnit : undefined,
      repeatType: value.repeatType,
      repeatConfig: value.repeatConfig,
    };
  },
});

const triggerBySubmit = computed(() => {
  return FlagEnum.has(selectedTriggers.value, EventType.Submitted);
});
const triggerByUpdate = computed(() => {
  return FlagEnum.has(selectedTriggers.value, EventType.Modified);
});
const triggerByDelete = computed(() => {
  return FlagEnum.has(selectedTriggers.value, EventType.Removed);
});
const triggerByApproving = computed(() => {
  return FlagEnum.has(selectedTriggers.value, EventType.Approving);
});
const triggerByApproved = computed(() => {
  return FlagEnum.has(selectedTriggers.value, EventType.Approved);
});
const triggerByRejected = computed(() => {
  return FlagEnum.has(selectedTriggers.value, EventType.Rejected);
});

const triggerList = computed(() => {
  const tList: any[] = [];

  if (triggerBySubmit.value)
    tList.push({ id: EventType.Submitted, title: t("eventFlow.addedRecord") });
  if (triggerByUpdate.value)
    tList.push({ id: EventType.Modified, title: t("eventFlow.updatedRecord") });
  if (triggerByDelete.value)
    tList.push({ id: EventType.Removed, title: t("eventFlow.deletedRecord") });
  if (triggerByApproving.value)
    tList.push({ id: EventType.Approving, title: t("eventFlow.wfNextNode") });
  if (triggerByApproved.value)
    tList.push({ id: EventType.Approved, title: t("eventFlow.wfApproved") });
  if (triggerByRejected.value)
    tList.push({ id: EventType.Rejected, title: t("eventFlow.wfRejected") });

  return tList;
});

const addTrigger = (t: EventType) => {
  selectedTriggers.value = FlagEnum.add(selectedTriggers.value, t);

  activeData.value.metadata.triggerMeta!.eventType = selectedTriggers.value;
};
const delTrigger = (t: EventType) => {
  selectedTriggers.value = FlagEnum.remove(selectedTriggers.value, t);
  activeData.value.metadata.triggerMeta!.eventType = selectedTriggers.value;
};

const onCondInput = (list: IConditionList) => {
  activeData.value.metadata.triggerMeta!.condition = list;
};
const onCondClear = () => {
  condList.value.items = [];
  activeData.value.metadata.queryManyMeta!.condition = condList.value;
};
const onNodeInput = (val: string) => {
  activeData.value.metadata.triggerMeta!.wfNodeId = val;
};
const onActionInput = (val: string) => {
  activeData.value.metadata.triggerMeta!.nodeAction = val;
};

function copyHookUrl() {
  navigator.clipboard.writeText(hookUrl.value).then(() => {
    ElMessage.success(t("comp.triggerNodeMeta.copied"));
  });
}

function parseIpText(value: string) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function syncAllowedIps() {
  if (!activeData.value.metadata.triggerMeta?.httpSettings) return;
  activeData.value.metadata.triggerMeta.httpSettings.allowedIps = parseIpText(allowedIpText.value);
}

function syncHttpSettings() {
  if (!activeData.value.metadata.triggerMeta?.httpSettings) return;
  activeData.value.metadata.triggerMeta.httpSettings.responseStatusCode = responseStatusCode.value;
  activeData.value.metadata.triggerMeta.httpSettings.responseContentType = responseContentType.value;
  activeData.value.metadata.triggerMeta.httpSettings.responseBody = responseBody.value;
}

function openSampleDialog() {
  if (!flowContext.definitionId) {
    ElMessage.warning(t("eventFlow.httpSampleDialog.errorNoDraft"));
    return;
  }
  showSampleDialog.value = true;
}

function onHttpSampleCaptured(result: EventFlowHttpSampleResult) {
  const settings = activeData.value.metadata.triggerMeta?.httpSettings;
  if (settings && result.sampleFields) {
    settings.sampleCapturedAt = result.capturedAt ?? Date.now();
    settings.sampleFields = result.sampleFields;
  }
  ElMessage.success(t("eventFlow.httpSampleDialog.viewSample"));
}

function buildNotifyTimeFieldOptions(formDef: FormDef): TriggerTimeFieldOption[] {
  const items: TriggerTimeFieldOption[] = [];

  (formDef.content?.items || []).forEach((field) => {
    if (field.type === FieldType.TimeStamp && field.field) {
      items.push({
        field: field.field,
        label: field.title,
        format: field.props?.format,
        type: field.type,
      });
    }
  });

  items.push({
    field: "createTime",
    label: t("comp.fieldBlock.systemFields.createTime"),
    format: "YYYY-MM-DD HH:mm:ss",
    type: FieldType.TimeStamp,
  });
  items.push({
    field: "updateTime",
    label: t("comp.fieldBlock.systemFields.updateTime"),
    format: "YYYY-MM-DD HH:mm:ss",
    type: FieldType.TimeStamp,
  });

  return items.filter((item, index, array) => array.findIndex((x) => x.field === item.field) === index);
}

onBeforeMount(() => {
  selectedTriggers.value =
    activeData.value.metadata.triggerMeta!.eventType ?? 0;
  condList.value = activeData.value.metadata.triggerMeta!.condition;
  wfNodeId.value = activeData.value.metadata.triggerMeta!.wfNodeId;
  nodeAction.value = activeData.value.metadata.triggerMeta!.nodeAction;
  allowedIpText.value = (activeData.value.metadata.triggerMeta?.httpSettings?.allowedIps ?? []).join("\n");

  formStore.get(flowContext.formId).then((form) => {
    formRef.value = form;
    if (form) {
      formName.value = form.name;
      usingFlow.value = form.usingWorkflow;
    } else {
      formName.value = t("eventFlow.unknownForm");
    }

    if (usingFlow.value) {
        let query = buildQuery({
        filter: { ExternalId: flowContext.formId, iscurrent: true },
      });
      wfDefinitionService.query<WfDefinition>(query).then((res) => {
        if (res && res.length > 0) {
          wfFlowData.value = JSON.parse(res[0].content);
          if (wfFlowData.value) {
            nodeList.value = buildWfNodeListItems(wfFlowData.value);
          }
        }
      });
    }
  });
});
</script>

<style lang="scss" scoped>
.section-indent {
  margin-left: var(--et-space-8);
}

.full-width-input {
  width: 100%;
}

.trigger-approving-content {
  flex-grow: 1;
  margin-left: var(--et-space-8);
  display: flex;
}

.trigger-node-select-wrap {
  flex: 1;
  margin: 0 var(--et-space-5);
  display: flex;
}

.trigger-node-select {
  flex: 1;
}

.trigger-action-select {
  width: var(--et-size-100);
  margin-right: var(--et-space-5);
}

.trigger-label {
  flex-grow: 1;
  margin-left: var(--et-space-8);
}

.trigger-delete {
  margin-left: var(--et-space-8);
}

.http-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.http-table {
  width: 100%;
}

.response-config {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.muted-text {
  color: var(--et-text-secondary);
}
</style>
