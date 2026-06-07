import {
  FieldType,
  FormDef,
  FormNotify,
  TimerRepeatType,
  FormNotifyTriggerMode,
  getCreateTime,
  getUpdateTime,
} from "@eimsnext/models";
import {
  TriggerTimeFieldOption,
  parseRepeatConfig as parseNotifyRepeatConfig,
} from "@eimsnext/components";

export type NotifyTimeFieldOption = TriggerTimeFieldOption;

export function getNotifyTimeFieldOptions(formDef: FormDef): NotifyTimeFieldOption[] {
  const items: NotifyTimeFieldOption[] = [];

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
    field: getCreateTime("提交时间").field,
    label: "提交时间",
    format: getCreateTime("提交时间").props?.format,
    type: FieldType.TimeStamp,
  });
  items.push({
    field: getUpdateTime("更新时间").field,
    label: "更新时间",
    format: getUpdateTime("更新时间").props?.format,
    type: FieldType.TimeStamp,
  });

  return items.filter((item, index, arr) => arr.findIndex((x) => x.field === item.field) === index);
}

export function getNotifyTimeFieldText(formDef: FormDef, field?: string): string {
  if (!field) {
    return "未设置";
  }

  return getNotifyTimeFieldOptions(formDef).find((item) => item.field === field)?.label || field;
}

export function getNotifyWeekdayText(value?: number): string {
  const map: Record<number, string> = {
    0: "周日",
    1: "周一",
    2: "周二",
    3: "周三",
    4: "周四",
    5: "周五",
    6: "周六",
  };

  return value == null ? "" : map[value] || "";
}

export function getNotifyWeekIndexText(value?: number): string {
  const map: Record<number, string> = {
    1: "第一个",
    2: "第二个",
    3: "第三个",
    4: "第四个",
    5: "最后一个",
  };

  return value == null ? "" : map[value] || "第一个";
}

export function formatNotifyDateTime(value?: number): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (num: number) => `${num}`.padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function getNotifyScheduleSummary(notify: FormNotify, formDef: FormDef): string {
  const parts: string[] = [];

  if (notify.triggerMode === FormNotifyTriggerMode.CustomScheduled && notify.startTime) {
    parts.push(`开始于 ${formatNotifyDateTime(notify.startTime)}`);
  }

  if (notify.triggerMode === FormNotifyTriggerMode.TimeFieldScheduled && notify.timeField) {
    parts.push(`字段 ${getNotifyTimeFieldText(formDef, notify.timeField)}`);
  }

  if (notify.endTime) {
    parts.push(`结束于 ${formatNotifyDateTime(notify.endTime)}`);
  }

  return parts.join("，");
}

export function getNotifyRepeatSummary(notify: FormNotify): string {
  if (notify.repeatType == null) {
    return "";
  }

  const map: Record<string, string> = {
    [TimerRepeatType.Once]: "仅提醒一次",
    [TimerRepeatType.Daily]: "每天",
    [TimerRepeatType.Weekly]: "每周",
    [TimerRepeatType.BiWeekly]: "每两周",
    [TimerRepeatType.Monthly]: "每月",
    [TimerRepeatType.Yearly]: "每年",
  };

  if (notify.repeatType !== TimerRepeatType.Custom) {
    return map[notify.repeatType] || "";
  }

  const config = parseNotifyRepeatConfig(notify.repeatConfig);
  if (!config?.mode) {
    return "自定义";
  }

  if (config.mode === "weekly") {
    const days = (config.weekdays || []).map(getNotifyWeekdayText).filter(Boolean).join("、");
    return `每 ${Math.max(1, config.interval || 1)} 周${days ? `，${days}` : ""}`;
  }

  if (config.mode === "monthly") {
    const prefix = `每 ${Math.max(1, config.interval || 1)} 月`;
    if (config.monthlyMode === "relative") {
      return `${prefix}，${getNotifyWeekIndexText(config.weekIndex)}${getNotifyWeekdayText(config.weekday)}`;
    }

    return `${prefix}，第 ${Math.max(1, config.monthDay || 1)} 天`;
  }

  return "自定义";
}
