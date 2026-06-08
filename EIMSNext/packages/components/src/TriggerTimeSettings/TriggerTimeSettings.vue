<template>
  <div class="trigger-time-settings">
    <div v-if="allowModeSwitch" class="row mode-row">
      <div class="label">{{ $t("comp.triggerTime.modeLabel") }}</div>
      <el-select v-model="localValue.mode" class="wide-input" @change="onModeChanged">
        <el-option :value="TriggerTimeMode.Custom" :label="$t('comp.triggerTime.customTime')" />
        <el-option :value="TriggerTimeMode.Field" :label="$t('comp.triggerTime.fieldTime')" />
      </el-select>
    </div>

    <template v-if="localValue.mode === TriggerTimeMode.Custom">
      <div class="row">
        <div class="label">{{ $t("comp.triggerTime.startTime") }}</div>
        <el-date-picker
          v-model="customStartTimeInput"
          class="wide-input"
          type="datetime"
          value-format="x"
          format="YYYY-MM-DD HH:mm:ss"
          :placeholder="$t('comp.triggerTime.startTimePlaceholder')"
        />
      </div>
    </template>

    <template v-else>
      <div class="row">
        <div class="label">{{ $t("comp.triggerTime.timeField") }}</div>
        <el-select v-model="localValue.field!.timeField" class="wide-input" :placeholder="$t('comp.triggerTime.timeFieldPlaceholder')" @change="onTimeFieldChanged">
          <el-option v-for="item in fieldOptions" :key="item.field" :label="item.label" :value="item.field" />
        </el-select>
      </div>

      <template v-if="currentFieldHasMinute">
        <div class="row split-row">
          <el-select v-model="localValue.field!.direction" class="short-input" @change="emitChange">
            <el-option :value="TimerOffsetDirection.Before" :label="$t('comp.triggerTime.before')" />
            <el-option :value="TimerOffsetDirection.At" :label="$t('comp.triggerTime.at')" />
            <el-option :value="TimerOffsetDirection.After" :label="$t('comp.triggerTime.after')" />
          </el-select>
          <template v-if="localValue.field!.direction !== TimerOffsetDirection.At">
            <el-input-number v-model="localValue.field!.offsetValue" class="number-input" :min="1" @change="emitChange" />
            <el-select v-model="localValue.field!.offsetUnit" class="short-input" @change="emitChange">
              <el-option :value="TimerOffsetUnit.Minute" :label="$t('comp.triggerTime.minute')" />
              <el-option :value="TimerOffsetUnit.Hour" :label="$t('comp.triggerTime.hour')" />
              <el-option :value="TimerOffsetUnit.Day" :label="$t('comp.triggerTime.day')" />
            </el-select>
          </template>
        </div>
      </template>
      <template v-else>
        <div class="row split-row">
          <el-select v-model="localValue.field!.direction" class="short-input" @change="emitChange">
            <el-option :value="TimerOffsetDirection.At" :label="$t('comp.triggerTime.at')" />
            <el-option :value="TimerOffsetDirection.Before" :label="$t('comp.triggerTime.before')" />
            <el-option :value="TimerOffsetDirection.After" :label="$t('comp.triggerTime.after')" />
          </el-select>
          <el-time-picker
            v-model="fixedTimeInput"
            class="wide-input"
            value-format="HH:mm"
            format="HH:mm"
            :placeholder="$t('common.pleaseInput')"
            @change="emitChange"
          />
        </div>
      </template>
    </template>

    <div class="row">
      <div class="label">{{ $t("comp.triggerTime.repeatLabel") }}</div>
      <el-select v-model="localValue.repeatType" class="wide-input" @change="onRepeatTypeChanged">
        <el-option v-for="item in repeatTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>

    <div v-if="showCustomRepeatConfig" class="repeat-config">
      <el-radio-group v-model="customRepeatMode" class="mode-group" @change="updateRepeatConfig">
        <el-radio label="weekly">{{ $t("comp.triggerTime.byWeek") }}</el-radio>
        <el-radio label="monthly">{{ $t("comp.triggerTime.byMonth") }}</el-radio>
      </el-radio-group>

      <template v-if="customRepeatMode === 'weekly'">
        <div class="inline-row">
          <span>{{ $t("comp.triggerTime.byWeek") }}</span>
          <el-input-number v-model="weeklyInterval" :min="1" :max="52" @change="updateRepeatConfig" />
          <span>{{ $t("comp.triggerTime.weekTrigger") }}</span>
        </div>
        <el-checkbox-group v-model="weeklyDays" class="weekdays-group" @change="updateRepeatConfig">
          <el-checkbox v-for="day in weekdayOptions" :key="day.value" :label="day.value">{{ $t(day.label) }}</el-checkbox>
        </el-checkbox-group>
      </template>

      <template v-else>
        <div class="inline-row">
          <span>{{ $t("comp.triggerTime.byMonth") }}</span>
          <el-input-number v-model="monthlyInterval" :min="1" :max="24" @change="updateRepeatConfig" />
          <span>{{ $t("comp.triggerTime.monthTrigger") }}</span>
        </div>
        <el-radio-group v-model="monthlyMode" class="mode-group" @change="updateRepeatConfig">
          <el-radio label="day">{{ $t("comp.triggerTime.specificDate") }}</el-radio>
          <el-radio label="relative">{{ $t("comp.triggerTime.relativeDate") }}</el-radio>
        </el-radio-group>

        <div v-if="monthlyMode === 'day'" class="inline-row">
          <span>{{ $t("comp.triggerTime.monthlyNth") }}</span>
          <el-input-number v-model="monthDay" :min="1" :max="31" @change="updateRepeatConfig" />
          <span>{{ $t("comp.triggerTime.daySuffix") }}</span>
        </div>

        <div v-else class="inline-row wrap-row">
          <span>{{ $t("comp.triggerTime.monthlyNth") }}</span>
          <el-select v-model="monthWeekIndex" class="short-input" @change="updateRepeatConfig">
            <el-option v-for="item in weekIndexOptions" :key="item.value" :label="$t(item.label)" :value="item.value" />
          </el-select>
          <el-select v-model="monthWeekday" class="short-input" @change="updateRepeatConfig">
            <el-option v-for="item in weekdayOptions" :key="item.value" :label="$t(item.label)" :value="item.value" />
          </el-select>
        </div>
      </template>
    </div>

    <div class="row">
      <div class="label">{{ $t("comp.triggerTime.endTime") }}</div>
      <el-date-picker
        v-model="endTimeInput"
        class="wide-input"
        type="datetime"
        value-format="x"
        format="YYYY-MM-DD HH:mm:ss"
        :placeholder="$t('comp.triggerTime.endTimePlaceholder')"
        clearable
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { TimerOffsetDirection, TimerOffsetUnit, TimerRepeatType } from "@eimsnext/models";
import {
  CustomRepeatConfig,
  TriggerTimeFieldOption,
  TriggerTimeMode,
  TriggerTimeSettingsValue,
} from "./type";
import {
  createDefaultTriggerTimeSettings,
  hasMinutePrecision,
  normalizeTriggerTimeSettings,
  parseRepeatConfig,
  stringifyRepeatConfig,
} from "./utils";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineOptions({
  name: "TriggerTimeSettings",
});

const props = withDefaults(
  defineProps<{
    modelValue: TriggerTimeSettingsValue;
    fieldOptions?: TriggerTimeFieldOption[];
    allowModeSwitch?: boolean;
  }>(),
  {
    fieldOptions: () => [],
    allowModeSwitch: true,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: TriggerTimeSettingsValue];
}>();

const repeatTypeOptions = computed(() => [
  { value: TimerRepeatType.Once, label: t("comp.triggerTime.once") },
  { value: TimerRepeatType.Daily, label: t("comp.triggerTime.daily") },
  { value: TimerRepeatType.Weekly, label: t("comp.triggerTime.weekly") },
  { value: TimerRepeatType.BiWeekly, label: t("comp.triggerTime.biWeekly") },
  { value: TimerRepeatType.Monthly, label: t("comp.triggerTime.monthly") },
  { value: TimerRepeatType.Yearly, label: t("comp.triggerTime.yearly") },
  { value: TimerRepeatType.Custom, label: t("comp.triggerTime.custom") },
]);

const weekdayOptions = computed(() => [
  { value: 0, label: t("comp.triggerTime.sun") },
  { value: 1, label: t("comp.triggerTime.mon") },
  { value: 2, label: t("comp.triggerTime.tue") },
  { value: 3, label: t("comp.triggerTime.wed") },
  { value: 4, label: t("comp.triggerTime.thu") },
  { value: 5, label: t("comp.triggerTime.fri") },
  { value: 6, label: t("comp.triggerTime.sat") },
]);

const weekIndexOptions = computed(() => [
  { value: 1, label: t("comp.triggerTime.first") },
  { value: 2, label: t("comp.triggerTime.second") },
  { value: 3, label: t("comp.triggerTime.third") },
  { value: 4, label: t("comp.triggerTime.fourth") },
  { value: 5, label: t("comp.triggerTime.last") },
]);

const localValue = ref<TriggerTimeSettingsValue>(normalizeTriggerTimeSettings(
  props.modelValue?.mode ? props.modelValue : createDefaultTriggerTimeSettings(TriggerTimeMode.Custom),
  props.fieldOptions,
));

const customRepeatMode = ref<"weekly" | "monthly">("weekly");
const weeklyInterval = ref(1);
const weeklyDays = ref<number[]>([1]);
const monthlyInterval = ref(1);
const monthlyMode = ref<"day" | "relative">("day");
const monthDay = ref(1);
const monthWeekIndex = ref(1);
const monthWeekday = ref(1);

const currentFieldHasMinute = computed(() => hasMinutePrecision(localValue.value.field?.fieldFormat));
const showCustomRepeatConfig = computed(() => localValue.value.repeatType === TimerRepeatType.Custom);

const customStartTimeInput = computed<string | undefined>({
  get: () => toInputValue(localValue.value.custom?.startTime),
  set: (value) => {
    if (!localValue.value.custom) {
      localValue.value.custom = {};
    }
    localValue.value.custom.startTime = toTimestamp(value) ?? Date.now();
    emitChange();
  },
});

const fixedTimeInput = computed<string | undefined>({
  get: () => localValue.value.field?.fixedTime,
  set: (value) => {
    if (!localValue.value.field) {
      localValue.value.field = {};
    }
    localValue.value.field.fixedTime = value || "09:00";
    emitChange();
  },
});

const endTimeInput = computed<string | undefined>({
  get: () => {
    const value = localValue.value.mode === TriggerTimeMode.Custom
      ? localValue.value.custom?.endTime
      : localValue.value.field?.endTime;
    return toInputValue(value);
  },
  set: (value) => {
    const endTime = toTimestamp(value);
    if (localValue.value.mode === TriggerTimeMode.Custom) {
      if (!localValue.value.custom) {
        localValue.value.custom = {};
      }
      localValue.value.custom.endTime = endTime;
    } else {
      if (!localValue.value.field) {
        localValue.value.field = {};
      }
      localValue.value.field.endTime = endTime;
    }
    emitChange();
  },
});

watch(
  () => props.modelValue,
  (value) => {
    localValue.value = normalizeTriggerTimeSettings(
      value?.mode ? value : createDefaultTriggerTimeSettings(TriggerTimeMode.Custom),
      props.fieldOptions,
    );
    initRepeatConfig();
  },
  { immediate: true, deep: true },
);

watch(
  () => props.fieldOptions,
  (value) => {
    localValue.value = normalizeTriggerTimeSettings(localValue.value, value || []);
    emitChange();
  },
  { deep: true },
);

function onModeChanged() {
  localValue.value = normalizeTriggerTimeSettings(localValue.value, props.fieldOptions);
  emitChange();
}

function onTimeFieldChanged(value?: string) {
  const option = props.fieldOptions.find((item) => item.field === value);
  if (!localValue.value.field) {
    localValue.value.field = {};
  }
  localValue.value.field.timeField = value;
  localValue.value.field.fieldFormat = option?.format;
  emitChange();
}

function onRepeatTypeChanged() {
  updateRepeatConfig();
  emitChange();
}

function initRepeatConfig() {
  const config = parseRepeatConfig(localValue.value.repeatConfig);
  customRepeatMode.value = config?.mode === "monthly" ? "monthly" : "weekly";
  weeklyInterval.value = Math.max(1, config?.interval ?? 1);
  weeklyDays.value = (config?.weekdays || []).filter((item) => item >= 0 && item <= 6);
  if (weeklyDays.value.length === 0) {
    weeklyDays.value = [1];
  }
  monthlyInterval.value = Math.max(1, config?.interval ?? 1);
  monthlyMode.value = config?.monthlyMode === "relative" ? "relative" : "day";
  monthDay.value = Math.min(31, Math.max(1, config?.monthDay ?? 1));
  monthWeekIndex.value = Math.min(5, Math.max(1, config?.weekIndex ?? 1));
  monthWeekday.value = Math.min(6, Math.max(0, config?.weekday ?? 1));
}

function updateRepeatConfig() {
  if (localValue.value.repeatType !== TimerRepeatType.Custom) {
    localValue.value.repeatConfig = undefined;
    return;
  }

  const config: CustomRepeatConfig = customRepeatMode.value === "weekly"
    ? {
        mode: "weekly",
        interval: Math.max(1, weeklyInterval.value || 1),
        weekdays: (weeklyDays.value.length ? weeklyDays.value : [1]).slice().sort((a, b) => a - b),
      }
    : {
        mode: "monthly",
        interval: Math.max(1, monthlyInterval.value || 1),
        monthlyMode: monthlyMode.value,
        monthDay: monthlyMode.value === "day" ? Math.min(31, Math.max(1, monthDay.value || 1)) : undefined,
        weekIndex: monthlyMode.value === "relative" ? Math.min(5, Math.max(1, monthWeekIndex.value || 1)) : undefined,
        weekday: monthlyMode.value === "relative" ? Math.min(6, Math.max(0, monthWeekday.value ?? 1)) : undefined,
      };

  localValue.value.repeatConfig = stringifyRepeatConfig(config);
}

function emitChange() {
  localValue.value = normalizeTriggerTimeSettings(localValue.value, props.fieldOptions);
  emit("update:modelValue", { ...localValue.value, custom: { ...localValue.value.custom }, field: { ...localValue.value.field } });
}

function toInputValue(value?: number) {
  return value == null ? undefined : `${value}`;
}

function toTimestamp(value?: string) {
  if (!value) {
    return undefined;
  }

  const result = Number(value);
  return Number.isFinite(result) ? result : undefined;
}
</script>

<style scoped>
.trigger-time-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.split-row {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.label {
  color: var(--et-text-primary-soft);
  font-weight: 600;
}

.wide-input {
  width: 100%;
}

.short-input {
  width: 120px;
}

.number-input {
  width: 120px;
}

.repeat-config {
  background: var(--et-fill-light);
  border-radius: var(--et-radius-6);
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
}

.mode-group {
  margin-bottom: 4px;
}

.inline-row {
  align-items: center;
  display: flex;
  gap: 8px;
}

.wrap-row {
  flex-wrap: wrap;
}

.weekdays-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
}
</style>
