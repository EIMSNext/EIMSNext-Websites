import { TimerOffsetDirection, TimerOffsetUnit, TimerRepeatType } from "@eimsnext/models";
import {
  CustomRepeatConfig,
  TriggerTimeFieldOption,
  TriggerTimeMode,
  TriggerTimeSettingsValue,
} from "./type";

export function hasMinutePrecision(format?: string): boolean {
  if (!format) {
    return true;
  }

  return /([hH]{1,2}:mm)|([hH]{1,2}:m)/.test(format);
}

export function parseRepeatConfig(value?: string): CustomRepeatConfig | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as CustomRepeatConfig;
  } catch {
    return null;
  }
}

export function stringifyRepeatConfig(value?: CustomRepeatConfig): string | undefined {
  return value ? JSON.stringify(value) : undefined;
}

export function createDefaultTriggerTimeSettings(mode: TriggerTimeMode): TriggerTimeSettingsValue {
  return {
    mode,
    repeatType: TimerRepeatType.Once,
    custom: { startTime: Date.now() },
    field: {
      direction: TimerOffsetDirection.At,
      offsetValue: 1,
      offsetUnit: TimerOffsetUnit.Minute,
      fixedTime: "09:00",
    },
  };
}

export function resolveFieldOption(options: TriggerTimeFieldOption[], timeField?: string) {
  return options.find((item) => item.field === timeField);
}

export function normalizeTriggerTimeSettings(
  value: TriggerTimeSettingsValue,
  options: TriggerTimeFieldOption[],
): TriggerTimeSettingsValue {
  const next: TriggerTimeSettingsValue = {
    mode: value.mode,
    repeatType: value.repeatType ?? TimerRepeatType.Once,
    repeatConfig: value.repeatConfig,
    custom: { ...(value.custom || {}) },
    field: { ...(value.field || {}) },
  };

  if (next.mode === TriggerTimeMode.Custom) {
    next.custom = {
      startTime: next.custom?.startTime ?? Date.now(),
      endTime: next.custom?.endTime,
    };
    next.field = {
      direction: TimerOffsetDirection.At,
      offsetValue: 1,
      offsetUnit: TimerOffsetUnit.Minute,
      fixedTime: "09:00",
    };
    return next;
  }

  const option = resolveFieldOption(options, next.field?.timeField) ?? options[0];
  next.field = {
    timeField: option?.field,
    fieldFormat: option?.format,
    direction: next.field?.direction ?? TimerOffsetDirection.At,
    fixedTime: next.field?.fixedTime || "09:00",
    offsetValue: Math.max(1, next.field?.offsetValue || 1),
    offsetUnit: next.field?.offsetUnit ?? TimerOffsetUnit.Minute,
    endTime: next.field?.endTime,
  };

  return next;
}
