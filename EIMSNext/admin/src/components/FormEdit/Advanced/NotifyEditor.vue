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
              <div class="label mode-label">提醒类型</div>
              <el-select
                :model-value="formNotify.triggerMode"
                class="notify-select"
                @change="updateTriggerMode"
              >
                <el-option
                  :value="FormNotifyTriggerMode.DataAdded"
                  label="新数据提交时提醒"
                />
                <el-option
                  :value="FormNotifyTriggerMode.DataChanged"
                  label="数据修改时提醒"
                />
                <el-option
                  :value="FormNotifyTriggerMode.CustomScheduled"
                  label="自定义定时提醒"
                />
                <el-option
                  :value="FormNotifyTriggerMode.TimeFieldScheduled"
                  label="字段定时提醒"
                />
              </el-select>

              <div v-if="showDataChangedTip" class="tip">
                提示：被提醒人若不在相关权限组中，收到提醒时无法查看数据。
              </div>

              <div v-if="showCustomModeTip" class="tip">
                提示：自定义定时提醒不关联具体数据，点击消息后将打开当前表单列表页。
              </div>

              <div v-if="showTimeFieldTip" class="tip">
                提示：字段定时提醒会以所选时间字段值作为首次提醒时间，再按重复规则持续提醒，直到结束时间。
              </div>

                <div v-if="showChangeFields" class="modify-fields">
                <div class="modify-fields-select">
                  <el-select
                    :model-value="changeMode"
                    class="notify-select"
                    @change="updateChangeMode"
                  >
                    <el-option value="all" label="任意字段修改后提醒" />
                    <el-option value="specific" label="指定字段修改后提醒" />
                  </el-select>
                  <el-button
                    v-if="changeMode === 'specific'"
                    type="primary"
                    style="margin-left: var(--et-space-12)"
                    @click="showFieldDialog = true"
                  >
                    选择字段 ({{ formNotify.changeFields?.length || 0 }})
                  </el-button>
                </div>
                <div v-if="changeMode === 'specific'" class="tip">
                  提示：如果设置了多个提醒字段，任意一个字段被修改就会触发提醒
                </div>
              </div>
            </div>

            <div v-if="showScheduleConfig" class="notify-schedule">
              <div class="label">提醒时间</div>

              <div v-if="isTimeFieldScheduled" class="notify-margin schedule-row">
                <div class="sub-label">时间字段</div>
                <el-select
                  :model-value="formNotify.timeField"
                  class="notify-select"
                  placeholder="请选择时间字段"
                  @change="updateTimeField"
                >
                  <el-option
                    v-for="field in availableTimeFields"
                    :key="field.field"
                    :label="field.label"
                    :value="field.field"
                  />
                </el-select>
              </div>

              <div v-if="isCustomScheduled" class="notify-margin schedule-row">
                <div class="sub-label">开始时间</div>
                <el-date-picker
                  v-model="startTimeInput"
                  class="notify-select"
                  type="datetime"
                  value-format="x"
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择开始时间"
                />
              </div>

              <div class="notify-margin schedule-row">
                <div class="sub-label">重复规则</div>
                <el-select :model-value="repeatTypeInput" class="notify-select" @change="updateRepeatType">
                  <el-option
                    v-for="item in repeatTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>

              <div v-if="showCustomRepeatConfig" class="notify-margin repeat-config">
                <div class="sub-label">自定义重复</div>

                <el-radio-group :model-value="customRepeatMode" class="monthly-mode-group" @change="updateCustomRepeatMode">
                  <el-radio label="weekly">按周</el-radio>
                  <el-radio label="monthly">按月</el-radio>
                </el-radio-group>

                <template v-if="customRepeatMode === 'weekly'">
                  <div class="repeat-inline">
                    <span>每</span>
                    <el-input-number :model-value="weeklyInterval" :min="1" :max="52" @update:modelValue="updateWeeklyInterval" />
                    <span>周提醒一次</span>
                  </div>
                  <el-checkbox-group :model-value="weeklyDays" class="weekdays-group" @change="updateWeeklyDays">
                    <el-checkbox
                      v-for="day in weekdayOptions"
                      :key="day.value"
                      :label="day.value"
                    >
                      {{ day.label }}
                    </el-checkbox>
                  </el-checkbox-group>
                </template>

                <template v-else>
                  <div class="repeat-inline">
                    <span>每</span>
                    <el-input-number :model-value="monthlyInterval" :min="1" :max="24" @update:modelValue="updateMonthlyInterval" />
                    <span>个月提醒一次</span>
                  </div>
                  <el-radio-group :model-value="monthlyMode" class="monthly-mode-group" @change="updateMonthlyMode">
                    <el-radio label="day">指定日期</el-radio>
                    <el-radio label="relative">相对日期</el-radio>
                  </el-radio-group>

                  <div v-if="monthlyMode === 'day'" class="repeat-inline">
                    <span>每月第</span>
                    <el-input-number :model-value="monthDay" :min="1" :max="31" @update:modelValue="updateMonthDay" />
                    <span>天</span>
                  </div>

                  <div v-else class="repeat-inline wrap">
                    <span>每月第</span>
                    <el-select :model-value="monthWeekIndex" class="short-select" @change="updateMonthWeekIndex">
                      <el-option
                        v-for="item in weekIndexOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                    <el-select :model-value="monthWeekday" class="short-select" @change="updateMonthWeekday">
                      <el-option
                        v-for="item in weekdayOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </div>
                </template>
              </div>

              <div class="notify-margin schedule-row">
                <div class="sub-label">结束时间</div>
                <el-date-picker
                  v-model="endTimeInput"
                  class="notify-select"
                  type="datetime"
                  value-format="x"
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="不设置则持续提醒"
                  clearable
                />
              </div>
            </div>

            <div v-if="showFilter" class="notify-filter">
              <div class="label">提醒条件</div>
              <el-select :model-value="filterMode" class="notify-select" @change="updateFilterMode">
                <el-option value="any" label="任意数据" />
                <el-option value="condition" label="满足条件的数据" />
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
              <div class="label">被提醒人</div>
              <selected-tags
                v-model="notifier"
                :editable="true"
                class="notify-margin"
                @editTag="editNotifier"
              />
              <div v-if="isCustomScheduled" class="tip">
                提示：自定义定时提醒不支持使用表单字段作为提醒人。
              </div>
            </div>

            <div class="notify-msg">
              <div class="label">提醒文字</div>
              <div class="content notify-margin">
                <el-input
                  v-if="isCustomScheduled"
                  v-model="customNotifyText"
                  type="textarea"
                  :rows="4"
                  maxlength="200"
                  show-word-limit
                  placeholder="请输入提醒内容"
                />
                <FieldBlockCodeEditor
                  v-else
                  :modelValue="formNotify.notifyText || ''"
                  :formDef="formDef"
                  :showSubFields="false"
                  :maxBlocks="6"
                  placeholder="请输入提醒内容或添加字段"
                  @update:modelValue="updateNotifyText"
                  @limit="notifyTextLimitReached"
                />
              </div>
            </div>

            <div class="notify-chanel">
              <div class="label">提醒方式</div>
              <div class="channel-item">
                <el-checkbox
                  :model-value="hasChannel(NotifyChannel.System)"
                  @change="toggleChannel(NotifyChannel.System, $event)"
                >
                  站内消息
                </el-checkbox>
                <el-checkbox
                  :model-value="hasChannel(NotifyChannel.Email)"
                  @change="toggleChannel(NotifyChannel.Email, $event)"
                >
                  邮箱消息
                </el-checkbox>
              </div>
            </div>
          </el-space>
        </div>
      </div>
      <div class="btn-pane"><el-button type="primary" @click="save">保存</el-button></div>
    </div>
  </div>

  <et-dialog
    v-model="showFieldDialog"
    title="提醒字段设置"
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
  FormNotifyRepeatType,
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
  convertCandidateToTags,
  convertTagsToCandidates,
} from "@eimsnext/components";
import { formNotifyService } from "@eimsnext/services";
import { ElMessage } from "element-plus";
import {
  CustomRepeatConfig,
  NotifyTimeFieldOption,
  getNotifyTimeFieldOptions,
  parseNotifyRepeatConfig,
} from "../../../utils/notify";

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
const customRepeatMode = ref<"weekly" | "monthly">("weekly");
const weeklyInterval = ref(1);
const weeklyDays = ref<number[]>([]);
const monthlyInterval = ref(1);
const monthlyMode = ref<"day" | "relative">("day");
const monthDay = ref(1);
const monthWeekIndex = ref(1);
const monthWeekday = ref(1);
const syncingFromModel = ref(false);

const memberOptions = {
  showTabs: MemberTabs.Department | MemberTabs.Role | MemberTabs.Employee,
  cascadedDept: true,
  showCascade: true,
};

const repeatTypeOptions = [
  { value: FormNotifyRepeatType.Once, label: "仅提醒一次" },
  { value: FormNotifyRepeatType.Daily, label: "每天" },
  { value: FormNotifyRepeatType.Weekly, label: "每周" },
  { value: FormNotifyRepeatType.BiWeekly, label: "每两周" },
  { value: FormNotifyRepeatType.Monthly, label: "每月" },
  { value: FormNotifyRepeatType.Yearly, label: "每年" },
  { value: FormNotifyRepeatType.Custom, label: "自定义" },
];

const weekdayOptions = [
  { value: 0, label: "周日" },
  { value: 1, label: "周一" },
  { value: 2, label: "周二" },
  { value: 3, label: "周三" },
  { value: 4, label: "周四" },
  { value: 5, label: "周五" },
  { value: 6, label: "周六" },
];

const weekIndexOptions = [
  { value: 1, label: "第一个" },
  { value: 2, label: "第二个" },
  { value: 3, label: "第三个" },
  { value: 4, label: "第四个" },
  { value: 5, label: "最后一个" },
];

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
const showCustomRepeatConfig = computed(
  () => showScheduleConfig.value && repeatTypeInput.value === FormNotifyRepeatType.Custom
);

const availableTimeFields = computed<NotifyTimeFieldOption[]>(() => {
  return getNotifyTimeFieldOptions(props.formDef);
});

const startTimeInput = computed<string | undefined>({
  get: () => toTimeInput(formNotify.value.startTime),
  set: (value) => {
    const nextValue = toTimestamp(value);
    formNotify.value.startTime = isCustomScheduled.value && nextValue == null ? Date.now() : nextValue;
    emitModelUpdate();
  },
});

const endTimeInput = computed<string | undefined>({
  get: () => toTimeInput(formNotify.value.endTime),
  set: (value) => {
    formNotify.value.endTime = toTimestamp(value);
    emitModelUpdate();
  },
});

const repeatTypeInput = computed<FormNotifyRepeatType>({
  get: () => formNotify.value.repeatType ?? FormNotifyRepeatType.Once,
  set: (value) => {
    formNotify.value.repeatType = value;
    if (value !== FormNotifyRepeatType.Custom) {
      formNotify.value.repeatConfig = undefined;
    } else {
      syncRepeatConfig();
    }
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
    formNotify.value.repeatType ??= FormNotifyRepeatType.Once;

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
    initRepeatConfig();
    normalizeState();
  } finally {
    syncingFromModel.value = false;
  }
}

function initRepeatConfig() {
  const config = parseNotifyRepeatConfig(formNotify.value.repeatConfig);
  customRepeatMode.value = config?.mode === "monthly" ? "monthly" : "weekly";
  weeklyInterval.value = Math.max(1, config?.interval ?? 1);
  weeklyDays.value = (config?.weekdays || []).filter((x) => x >= 0 && x <= 6);
  monthlyInterval.value = Math.max(1, config?.interval ?? 1);
  monthlyMode.value = config?.monthlyMode === "relative" ? "relative" : "day";
  monthDay.value = normalizeMonthDay(config?.monthDay ?? 1);
  monthWeekIndex.value = normalizeWeekIndex(config?.weekIndex ?? 1);
  monthWeekday.value = normalizeWeekday(config?.weekday ?? 1);

  if (weeklyDays.value.length === 0) {
    weeklyDays.value = [1];
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
  formNotify.value.startTime = undefined;
  formNotify.value.endTime = undefined;
  formNotify.value.repeatType = FormNotifyRepeatType.Once;
  formNotify.value.repeatConfig = undefined;

  filter.value = { id: "", rel: "and", items: [] };
  filterMode.value = "any";
  notifier.value = [];
  changeMode.value = "all";
  tempChangeFields.value = [];
  customRepeatMode.value = "weekly";
  weeklyInterval.value = 1;
  weeklyDays.value = [1];
  monthlyInterval.value = 1;
  monthlyMode.value = "day";
  monthDay.value = 1;
  monthWeekIndex.value = 1;
  monthWeekday.value = 1;

  if (isTimeFieldScheduled.value) {
    formNotify.value.timeField = availableTimeFields.value[0]?.field;
  }

  normalizeState();
  emitModelUpdate();
}

function getDefaultNotifyText() {
  if (formNotify.value.triggerMode === FormNotifyTriggerMode.DataAdded) {
    return "有新数据提交，请及时处理";
  }
  if (formNotify.value.triggerMode === FormNotifyTriggerMode.DataChanged) {
    return "有数据被修改，请及时处理";
  }
  if (formNotify.value.triggerMode === FormNotifyTriggerMode.TimeFieldScheduled) {
    return "有数据到期，请及时处理";
  }

  return "已到提醒时间，请及时处理";
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
    ElMessage.warning("自定义定时提醒不支持使用表单字段作为提醒人");
  }

  formNotify.value.notifiers = JSON.stringify(normalizedCandidates);
  notifier.value = normalizedCandidates.flatMap((c) => convertCandidateToTags(c));
  showMemberDialog.value = false;
  emitModelUpdate();
}

function notifyTextLimitReached() {
  ElMessage.warning("提醒文字最多添加6个字段");
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

  if (formNotify.value.repeatType === FormNotifyRepeatType.Custom) {
    syncRepeatConfig();
  } else {
    formNotify.value.repeatConfig = undefined;
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

function syncRepeatConfig() {
  if (formNotify.value.repeatType !== FormNotifyRepeatType.Custom) {
    formNotify.value.repeatConfig = undefined;
    return;
  }

  const config: CustomRepeatConfig =
    customRepeatMode.value === "weekly"
      ? {
          mode: "weekly",
          interval: Math.max(1, weeklyInterval.value || 1),
          weekdays: (weeklyDays.value.length ? weeklyDays.value : [1]).slice().sort((a, b) => a - b),
        }
      : {
          mode: "monthly",
          interval: Math.max(1, monthlyInterval.value || 1),
          monthlyMode: monthlyMode.value,
          monthDay: monthlyMode.value === "day" ? normalizeMonthDay(monthDay.value) : undefined,
          weekIndex: monthlyMode.value === "relative" ? normalizeWeekIndex(monthWeekIndex.value) : undefined,
          weekday: monthlyMode.value === "relative" ? normalizeWeekday(monthWeekday.value) : undefined,
        };

  formNotify.value.repeatConfig = JSON.stringify(config);
}

function toTimeInput(value?: number) {
  return value == null ? undefined : `${value}`;
}

function toTimestamp(value?: string) {
  if (!value) {
    return undefined;
  }

  const result = Number(value);
  return Number.isFinite(result) ? result : undefined;
}

function normalizeMonthDay(value: number) {
  return Math.min(31, Math.max(1, Math.trunc(value || 1)));
}

function normalizeWeekIndex(value: number) {
  return Math.min(5, Math.max(1, Math.trunc(value || 1)));
}

function normalizeWeekday(value: number) {
  return Math.min(6, Math.max(0, Math.trunc(value ?? 1)));
}

function updateTimeField(value?: string) {
  formNotify.value.timeField = value;
  emitModelUpdate();
}

function updateRepeatType(value: FormNotifyRepeatType) {
  formNotify.value.repeatType = value;
  if (value === FormNotifyRepeatType.Custom) {
    syncRepeatConfig();
  } else {
    formNotify.value.repeatConfig = undefined;
  }
  emitModelUpdate();
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

function updateCustomRepeatMode(value: string | number | boolean | undefined) {
  customRepeatMode.value = value === "monthly" ? "monthly" : "weekly";
  syncRepeatConfig();
  emitModelUpdate();
}

function updateWeeklyInterval(value?: number) {
  weeklyInterval.value = Math.max(1, value || 1);
  syncRepeatConfig();
  emitModelUpdate();
}

function updateWeeklyDays(value: Array<string | number | boolean>) {
  const normalized = value
    .map((item) => (typeof item === "number" ? item : Number(item)))
    .filter((item) => Number.isInteger(item) && item >= 0 && item <= 6);

  weeklyDays.value = normalized.length ? normalized : [1];
  syncRepeatConfig();
  emitModelUpdate();
}

function updateMonthlyInterval(value?: number) {
  monthlyInterval.value = Math.max(1, value || 1);
  syncRepeatConfig();
  emitModelUpdate();
}

function updateMonthlyMode(value: string | number | boolean | undefined) {
  monthlyMode.value = value === "relative" ? "relative" : "day";
  syncRepeatConfig();
  emitModelUpdate();
}

function updateMonthDay(value?: number) {
  monthDay.value = normalizeMonthDay(value || 1);
  syncRepeatConfig();
  emitModelUpdate();
}

function updateMonthWeekIndex(value: number) {
  monthWeekIndex.value = normalizeWeekIndex(value);
  syncRepeatConfig();
  emitModelUpdate();
}

function updateMonthWeekday(value: number) {
  monthWeekday.value = normalizeWeekday(value);
  syncRepeatConfig();
  emitModelUpdate();
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
    ElMessage.error("保存失败");
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
