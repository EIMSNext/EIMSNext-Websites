<template>
  <div class="api-config-pane">
    <div class="config-content">
      <div class="config-pane">
        <div class="config-editor">
          <el-space
            direction="vertical"
            :fill="true"
            alignment="start"
            :size="20"
            style="width: 100%"
          >
            <div class="notify-mode">
              <div class="label mode-label">{{ t("admin.notify.type") }}</div>
              <el-select
                :model-value="formNotify.triggerMode"
                class="notify-select"
                @change="updateTriggerMode"
              >
                <el-option
                  :value="FormNotifyTriggerMode.DataAdded"
                  :label="t('admin.notify.mode.dataAddedNotify')"
                />
                <el-option
                  :value="FormNotifyTriggerMode.DataChanged"
                  :label="t('admin.notify.mode.dataChangedNotify')"
                />
                <el-option
                  :value="FormNotifyTriggerMode.CustomScheduled"
                  :label="t('admin.notify.mode.customScheduledNotify')"
                />
                <el-option
                  :value="FormNotifyTriggerMode.TimeFieldScheduled"
                  :label="t('admin.notify.mode.timeFieldScheduledNotify')"
                />
              </el-select>

              <div v-if="showDataChangedTip" class="tip">
                {{ t("admin.notify.dataChangedTip") }}
              </div>

              <div v-if="showCustomModeTip" class="tip">
                {{ t("admin.notify.customModeTip") }}
              </div>

              <div v-if="showTimeFieldTip" class="tip">
                {{ t("admin.notify.timeFieldTip") }}
              </div>

                <div v-if="showChangeFields" class="modify-fields">
                <div class="modify-fields-select">
                  <el-select
                    :model-value="changeMode"
                    class="notify-select"
                    @change="updateChangeMode"
                  >
                    <el-option value="all" :label="t('admin.notify.changeMode.all')" />
                    <el-option value="specific" :label="t('admin.notify.changeMode.specific')" />
                  </el-select>
                  <el-button
                    v-if="changeMode === 'specific'"
                    type="primary"
                    style="margin-left: var(--et-space-12)"
                    @click="showFieldDialog = true"
                  >
                    {{ t("admin.notify.selectField") }} ({{ formNotify.changeFields?.length || 0 }})
                  </el-button>
                </div>
                <div v-if="changeMode === 'specific'" class="tip">
                  {{ t("admin.notify.specificFieldTip") }}
                </div>
              </div>
            </div>

            <div v-if="showScheduleConfig" class="notify-schedule">
              <div class="label">{{ t("admin.notify.time") }}</div>
              <TriggerTimeSettings
                v-model="scheduleSettings"
                class="notify-margin"
                :field-options="availableTimeFields"
                :allow-mode-switch="false"
              />
            </div>

            <div v-if="showFilter" class="notify-filter">
              <div class="label">{{ t("admin.notify.condition") }}</div>
              <el-select :model-value="filterMode" class="notify-select" @change="updateFilterMode">
                <el-option value="any" :label="t('admin.notify.filterMode.any')" />
                <el-option value="condition" :label="t('admin.notify.filterMode.condition')" />
              </el-select>
              <condition-list
                v-if="filterMode === 'condition'"
                :model-value="filter"
                :form-id="formDef.id"
                :max-level="1"
                @update:modelValue="updateFilter"
              />
            </div>

            <div class="notify-notifier">
              <div class="label">{{ t("admin.notify.notifier") }}</div>
              <selected-tags
                v-model="notifier"
                :editable="true"
                class="notify-margin"
                @editTag="editNotifier"
              />
              <div v-if="isCustomScheduled" class="tip">
                {{ t("admin.notify.customNotifierTip") }}
              </div>
            </div>

            <div class="notify-msg">
              <div class="label">{{ t("admin.notify.text") }}</div>
              <div class="content notify-margin">
                <el-input
                  v-if="isCustomScheduled"
                  v-model="customNotifyText"
                  type="textarea"
                  :rows="4"
                  maxlength="200"
                  show-word-limit
                  :placeholder="t('admin.notify.placeholder.customText')"
                />
                <FieldBlockCodeEditor
                  v-else
                  :modelValue="formNotify.notifyText || ''"
                  :formDef="formDef"
                  :showSubFields="false"
                  :maxBlocks="6"
                  :placeholder="t('admin.notify.placeholder.richText')"
                  @update:modelValue="updateNotifyText"
                  @limit="notifyTextLimitReached"
                />
              </div>
            </div>

            <div class="notify-chanel">
              <div class="label">{{ t("admin.notify.channel") }}</div>
              <div class="channel-item">
                <el-checkbox
                  :model-value="hasChannel(NotifyChannel.System)"
                  @change="toggleChannel(NotifyChannel.System, $event)"
                >
                  {{ t("admin.notify.channels.system") }}
                </el-checkbox>
                <el-checkbox
                  :model-value="hasChannel(NotifyChannel.Email)"
                  @change="toggleChannel(NotifyChannel.Email, $event)"
                >
                  {{ t("admin.notify.channels.email") }}
                </el-checkbox>
              </div>
            </div>
          </el-space>
        </div>
      </div>
      <div class="btn-pane"><el-button type="primary" @click="save">{{ t("common.save") }}</el-button></div>
    </div>
  </div>

  <et-dialog
    v-model="showFieldDialog"
    :title="t('admin.notify.fieldDialogTitle')"
    width="500px"
    @ok="confirmFieldSelection"
  >
    <div class="dialog-body">
      <field-select-list
        v-model="tempChangeFields"
        :form-id="formDef.id"
        :showSubFields="false"
        style="border: none"
      />
    </div>
  </et-dialog>

  <member-select-dialog
    v-model="showMemberDialog"
    :tags="notifier"
    :member-options="memberOptions"
    @ok="finishSelectNotifier"
  />
</template>

<script setup lang="ts">
import {
  FormDef,
  FormNotify,
  TimerOffsetDirection,
  TimerOffsetUnit,
  TimerRepeatType,
  FormNotifyRequest,
  FormNotifyTriggerMode,
  NotifyChannel,
} from "@eimsnext/models";
import { FlagEnum } from "@eimsnext/utils";
import { cloneDeep } from "lodash-es";
import {
  ConditionList,
  FieldBlockCodeEditor,
  FieldSelectList,
  IApprovalCandidate,
  IConditionList,
  ISelectedTag,
  MemberSelectDialog,
  MemberTabs,
  SelectedTags,
  TriggerTimeMode,
  TriggerTimeSettings,
  TriggerTimeSettingsValue,
  createDefaultTriggerTimeSettings,
  convertCandidateToTags,
  convertTagsToCandidates,
  normalizeTriggerTimeSettings,
} from "@eimsnext/components";
import { formNotifyService } from "@eimsnext/services";
import { ElMessage } from "element-plus";
import { NotifyTimeFieldOption, getNotifyTimeFieldOptions } from "../../../utils/notify";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineOptions({
  name: "NotifyEditor",
});

const FORM_FIELD_CANDIDATE_TYPE = 5;

const props = defineProps<{
  modelValue: FormNotify;
  formDef: FormDef;
}>();

const emit = defineEmits(["update:modelValue", "saved"]);

const formNotify = ref<FormNotify>(cloneDeep(props.modelValue));
const filter = ref<IConditionList>({ id: "", rel: "and", items: [] });
const notifier = ref<ISelectedTag[]>([]);
const changeMode = ref<"all" | "specific">("all");
const filterMode = ref<"any" | "condition">("any");
const showFieldDialog = ref(false);
const showMemberDialog = ref(false);
const tempChangeFields = ref<string[]>([]);
const syncingFromModel = ref(false);

const memberOptions = {
  showTabs: MemberTabs.Department | MemberTabs.Role | MemberTabs.Employee,
  cascadedDept: true,
  showCascade: true,
};

const isCustomScheduled = computed(
  () => formNotify.value.triggerMode === FormNotifyTriggerMode.CustomScheduled
);
const isTimeFieldScheduled = computed(
  () => formNotify.value.triggerMode === FormNotifyTriggerMode.TimeFieldScheduled
);
const showScheduleConfig = computed(() => isCustomScheduled.value || isTimeFieldScheduled.value);
const showFilter = computed(() => !isCustomScheduled.value);
const showChangeFields = computed(
  () => formNotify.value.triggerMode === FormNotifyTriggerMode.DataChanged
);
const showDataChangedTip = computed(() => showChangeFields.value);
const showCustomModeTip = computed(() => isCustomScheduled.value);
const showTimeFieldTip = computed(() => isTimeFieldScheduled.value);

const availableTimeFields = computed<NotifyTimeFieldOption[]>(() => {
  return getNotifyTimeFieldOptions(props.formDef, t);
});

const scheduleSettings = computed<TriggerTimeSettingsValue>({
  get: () => {
    const mode = isCustomScheduled.value ? TriggerTimeMode.Custom : TriggerTimeMode.Field;
    return normalizeTriggerTimeSettings({
      mode,
      repeatType: formNotify.value.repeatType,
      repeatConfig: formNotify.value.repeatConfig,
      custom: {
        startTime: formNotify.value.startTime,
        endTime: isCustomScheduled.value ? formNotify.value.endTime : undefined,
      },
      field: {
        timeField: formNotify.value.timeField,
        endTime: isTimeFieldScheduled.value ? formNotify.value.endTime : undefined,
        fixedTime: formNotify.value.fixedTime,
        direction: formNotify.value.direction,
        offsetValue: formNotify.value.offsetValue,
        offsetUnit: formNotify.value.offsetUnit,
      },
    }, availableTimeFields.value);
  },
  set: (value) => {
    const normalized = normalizeTriggerTimeSettings(value, availableTimeFields.value);
    formNotify.value.repeatType = normalized.repeatType;
    formNotify.value.repeatConfig = normalized.repeatConfig;
    if (normalized.mode === TriggerTimeMode.Custom) {
      formNotify.value.startTime = normalized.custom?.startTime;
      formNotify.value.endTime = normalized.custom?.endTime;
      formNotify.value.timeField = undefined;
      formNotify.value.fixedTime = undefined;
      formNotify.value.direction = TimerOffsetDirection.At;
      formNotify.value.offsetValue = undefined;
      formNotify.value.offsetUnit = undefined;
      formNotify.value.fieldFormat = undefined;
    } else {
      formNotify.value.startTime = undefined;
      formNotify.value.timeField = normalized.field?.timeField;
      formNotify.value.endTime = normalized.field?.endTime;
      formNotify.value.fixedTime = normalized.field?.fixedTime;
      formNotify.value.direction = normalized.field?.direction ?? TimerOffsetDirection.At;
      formNotify.value.offsetValue = normalized.field?.offsetValue;
      formNotify.value.offsetUnit = normalized.field?.offsetUnit;
      const option = availableTimeFields.value.find((x) => x.field === normalized.field?.timeField);
      formNotify.value.fieldFormat = option?.format;
    }
    emitModelUpdate();
  },
});

const customNotifyText = computed<string>({
  get: () => formNotify.value.notifyText || "",
  set: (value) => {
    formNotify.value.notifyText = value;
    emitModelUpdate();
  },
});

function initFromModelValue() {
  syncingFromModel.value = true;
  try {
    formNotify.value = cloneDeep(props.modelValue);
    formNotify.value.repeatType ??= TimerRepeatType.Once;

    if (formNotify.value.dataFilter) {
      try {
        filter.value = JSON.parse(formNotify.value.dataFilter);
        filterMode.value = "condition";
      } catch {
        filter.value = { id: "", rel: "and", items: [] };
        filterMode.value = "any";
      }
    } else {
      filter.value = { id: "", rel: "and", items: [] };
      filterMode.value = "any";
    }

    if (formNotify.value.notifiers) {
      try {
        const candidates: IApprovalCandidate[] = JSON.parse(formNotify.value.notifiers);
        notifier.value = candidates.flatMap((c) => convertCandidateToTags(c));
      } catch {
        notifier.value = [];
      }
    } else {
      notifier.value = [];
    }

    if (showChangeFields.value && formNotify.value.changeFields && formNotify.value.changeFields.length > 0) {
      changeMode.value = "specific";
    } else {
      changeMode.value = "all";
    }

    tempChangeFields.value = [...(formNotify.value.changeFields || [])];
    normalizeState();
  } finally {
    syncingFromModel.value = false;
  }
}

function updateTriggerMode(value: FormNotifyTriggerMode) {
  formNotify.value.triggerMode = value;
  formNotify.value.changeFields = [];
  formNotify.value.dataFilter = "";
  formNotify.value.notifiers = "[]";
  formNotify.value.notifyText = getDefaultNotifyText();
  formNotify.value.channels = NotifyChannel.System;
  formNotify.value.timeField = undefined;
  formNotify.value.fixedTime = undefined;
  formNotify.value.direction = TimerOffsetDirection.At;
  formNotify.value.offsetValue = undefined;
  formNotify.value.offsetUnit = undefined;
  formNotify.value.fieldFormat = undefined;
  formNotify.value.startTime = undefined;
  formNotify.value.endTime = undefined;
  formNotify.value.repeatType = TimerRepeatType.Once;
  formNotify.value.repeatConfig = undefined;

  filter.value = { id: "", rel: "and", items: [] };
  filterMode.value = "any";
  notifier.value = [];
  changeMode.value = "all";
  tempChangeFields.value = [];

  if (isTimeFieldScheduled.value) {
    const defaults = normalizeTriggerTimeSettings(
      createDefaultTriggerTimeSettings(TriggerTimeMode.Field),
      availableTimeFields.value,
    );
    formNotify.value.timeField = defaults.field?.timeField;
  }

  normalizeState();
  emitModelUpdate();
}

function getDefaultNotifyText() {
  if (formNotify.value.triggerMode === FormNotifyTriggerMode.DataAdded) {
    return t("admin.notify.defaultText");
  }
  if (formNotify.value.triggerMode === FormNotifyTriggerMode.DataChanged) {
    return t("admin.notify.dataChangedText");
  }
  if (formNotify.value.triggerMode === FormNotifyTriggerMode.TimeFieldScheduled) {
    return t("admin.notify.expiredText");
  }

  return t("admin.notify.dueText");
}

function confirmFieldSelection() {
  formNotify.value.changeFields = [...tempChangeFields.value];
  showFieldDialog.value = false;
  emitModelUpdate();
}

function hasChannel(channel: NotifyChannel): boolean {
  return FlagEnum.has(formNotify.value.channels, channel);
}

function toggleChannel(channel: NotifyChannel, checked: string | number | boolean) {
  if (Boolean(checked)) {
    formNotify.value.channels = FlagEnum.add(formNotify.value.channels, channel);
  } else {
    formNotify.value.channels = FlagEnum.remove(formNotify.value.channels, channel);
  }

  emitModelUpdate();
}

function editNotifier() {
  showMemberDialog.value = true;
}

function finishSelectNotifier(tags: ISelectedTag[]) {
  const candidates: IApprovalCandidate[] = convertTagsToCandidates(tags);
    const normalizedCandidates = isCustomScheduled.value
    ? candidates.filter((item) => item.candidateType !== FORM_FIELD_CANDIDATE_TYPE)
    : candidates;

  if (isCustomScheduled.value && normalizedCandidates.length !== candidates.length) {
    ElMessage.warning(t("admin.notify.customNotifierTip"));
  }

  formNotify.value.notifiers = JSON.stringify(normalizedCandidates);
  notifier.value = normalizedCandidates.flatMap((c) => convertCandidateToTags(c));
  showMemberDialog.value = false;
  emitModelUpdate();
}

function notifyTextLimitReached() {
  ElMessage.warning(t("admin.notify.fieldLimitTip"));
}

function updateNotifyText(value: string) {
  formNotify.value.notifyText = value;
  emitModelUpdate();
}

function normalizeState() {
  if (isCustomScheduled.value) {
    filter.value = { id: "", rel: "and", items: [] };
    filterMode.value = "any";
    formNotify.value.dataFilter = "";

    if (!formNotify.value.startTime) {
      formNotify.value.startTime = Date.now();
    }

    formNotify.value.timeField = undefined;
    sanitizeCustomNotifier();
  } else {
    if (!formNotify.value.notifiers) {
      formNotify.value.notifiers = "[]";
    }

    if (!showScheduleConfig.value) {
      formNotify.value.timeField = undefined;
      formNotify.value.fixedTime = undefined;
      formNotify.value.direction = TimerOffsetDirection.At;
      formNotify.value.offsetValue = undefined;
      formNotify.value.offsetUnit = undefined;
      formNotify.value.fieldFormat = undefined;
      formNotify.value.startTime = undefined;
      formNotify.value.endTime = undefined;
      formNotify.value.repeatType = undefined;
      formNotify.value.repeatConfig = undefined;
    }
  }

  if (isTimeFieldScheduled.value) {
    if (!availableTimeFields.value.some((x) => x.field === formNotify.value.timeField)) {
      formNotify.value.timeField = availableTimeFields.value[0]?.field;
    }

    formNotify.value.startTime = undefined;
  }

  if (!showChangeFields.value) {
    formNotify.value.changeFields = [];
    changeMode.value = "all";
  }

  if (!showFilter.value) {
    formNotify.value.dataFilter = "";
  }

  if (showScheduleConfig.value) {
    const normalized = scheduleSettings.value;
    formNotify.value.repeatType = normalized.repeatType;
    formNotify.value.repeatConfig = normalized.repeatConfig;
  }
}

function sanitizeCustomNotifier() {
  try {
    const parsed: IApprovalCandidate[] = JSON.parse(formNotify.value.notifiers || "[]");
    const normalized = parsed.filter((item) => item.candidateType !== FORM_FIELD_CANDIDATE_TYPE);
    formNotify.value.notifiers = JSON.stringify(normalized);
    notifier.value = normalized.flatMap((c) => convertCandidateToTags(c));
  } catch {
    formNotify.value.notifiers = "[]";
    notifier.value = [];
  }
}

function emitModelUpdate() {
  if (syncingFromModel.value) {
    return;
  }

  emit("update:modelValue", formNotify.value);
}

function updateFilterMode(value: "any" | "condition") {
  filterMode.value = value;
  formNotify.value.dataFilter = value === "condition" ? JSON.stringify(filter.value) : "";
  emitModelUpdate();
}

function updateFilter(value: IConditionList) {
  filter.value = value;
  if (showFilter.value && filterMode.value === "condition") {
    formNotify.value.dataFilter = JSON.stringify(value);
    emitModelUpdate();
  }
}

function updateChangeMode(value: "all" | "specific") {
  changeMode.value = value;
  if (value === "all") {
    formNotify.value.changeFields = [];
    tempChangeFields.value = [];
    emitModelUpdate();
  }
}

watch(showFieldDialog, (val) => {
  if (val) {
    tempChangeFields.value = [...(formNotify.value.changeFields || [])];
  }
});

watch(
  () => props.modelValue,
  () => {
    initFromModelValue();
  },
  { deep: true }
);

onMounted(() => {
  initFromModelValue();
});

const save = async () => {
  try {
    normalizeState();

    const request: FormNotifyRequest = {
      id: formNotify.value.id,
      appId: formNotify.value.appId,
      formId: formNotify.value.formId,
      triggerMode: formNotify.value.triggerMode,
      timeField: formNotify.value.timeField,
      fixedTime: formNotify.value.fixedTime,
      direction: formNotify.value.direction,
      offsetValue: formNotify.value.offsetValue,
      offsetUnit: formNotify.value.offsetUnit,
      fieldFormat: formNotify.value.fieldFormat,
      startTime: formNotify.value.startTime,
      endTime: formNotify.value.endTime,
      repeatType: formNotify.value.repeatType,
      repeatConfig: formNotify.value.repeatConfig,
      changeFields: formNotify.value.changeFields,
      dataFilter: formNotify.value.dataFilter,
      notifyText: formNotify.value.notifyText,
      notifiers: formNotify.value.notifiers,
      channels: formNotify.value.channels,
      disabled: formNotify.value.disabled,
    };

    if (formNotify.value.id) {
      formNotify.value = await formNotifyService.put<FormNotify>(formNotify.value.id, request);
    } else {
      formNotify.value = await formNotifyService.post<FormNotify>(request);
    }

    emit("saved", formNotify.value);
  } catch (error) {
    console.error("保存提醒配置失败:", error);
    ElMessage.error(t("admin.notify.saveFailed"));
  }
};
</script>

<style lang="scss" scoped>
.api-config-pane {
  background: var(--et-bg-page);
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;

  .config-content {
    background: var(--et-bg-container);
    border-radius: var(--et-radius-6);
    bottom: 0;
    left: 0;
    margin: var(--et-space-20) auto;
    position: absolute;
    right: 0;
    top: 0;
    width: var(--et-size-700);

    .config-pane {
      bottom: 56px;
      left: 0;
      overflow: auto;
      padding: 0 var(--et-space-30) var(--et-space-10);
      position: absolute;
      right: 0;
      top: 0;

      .config-editor {
        bottom: 0px;
        left: 0;
        overflow: auto;
        padding: 20px;
        position: absolute;
        right: 0;
        top: 0;

        .label {
          color: var(--et-text-primary-soft);
          font-size: 600;
        }

        .sub-label {
          color: var(--et-text-secondary);
          font-size: var(--et-font-size-13);
          margin-bottom: 6px;
        }

        .mode-label {
          margin-top: 0;
        }

        .notify-select {
          margin: 6px 0;
          width: 280px;
        }

        .notify-margin {
          margin: 6px 0;
        }

        .tip {
          color: var(--et-text-secondary-soft);
          font-size: 12px;
        }

        .modify-fields-select {
          align-items: center;
          display: flex;
        }

        .schedule-row {
          width: 100%;
        }

        .repeat-config {
          background: var(--et-fill-light);
          border-radius: var(--et-radius-6);
          padding: 12px;
          width: 100%;
        }

        .repeat-inline {
          align-items: center;
          display: flex;
          gap: 8px;
          margin-bottom: 10px;

          &.wrap {
            flex-wrap: wrap;
          }
        }

        .weekdays-group {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 16px;
        }

        .monthly-mode-group {
          margin-bottom: 10px;
        }

        .short-select {
          width: 120px;
        }

        .notify-chanel {
          .channel-item {
            margin-bottom: 12px;
          }
        }
      }
    }

    .btn-pane {
      align-items: center;
      border-top: 1px solid var(--et-border-color);
      bottom: 0;
      display: flex;
      height: var(--et-size-56);
      justify-content: center;
      left: 0;
      position: absolute;
      right: 0;
    }
  }
}

.dialog-body {
  height: 400px;
  padding: 0 var(--et-space-20) var(--et-space-10);
}
</style>
