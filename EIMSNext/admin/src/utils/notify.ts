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

export function getNotifyTimeFieldOptions(formDef: FormDef, t?: (key: string, params?: Record<string, any>) => string): NotifyTimeFieldOption[] {
  const items: NotifyTimeFieldOption[] = [];
  const systemLabel = (key: "createTime" | "updateTime") =>
    t ? t(`comp.fieldBlock.systemFields.${key}`) : ({
      createTime: "提交时间",
      updateTime: "更新时间",
    }[key]);

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
    field: getCreateTime(systemLabel("createTime")).field,
    label: systemLabel("createTime"),
    format: getCreateTime(systemLabel("createTime")).props?.format,
    type: FieldType.TimeStamp,
  });
  items.push({
    field: getUpdateTime(systemLabel("updateTime")).field,
    label: systemLabel("updateTime"),
    format: getUpdateTime(systemLabel("updateTime")).props?.format,
    type: FieldType.TimeStamp,
  });

  return items.filter((item, index, arr) => arr.findIndex((x) => x.field === item.field) === index);
}

export function getNotifyTimeFieldText(formDef: FormDef, field?: string, t?: (key: string, params?: Record<string, any>) => string): string {
  if (!field) {
    return t ? t("admin.notifyTime.notSet") : "未设置";
  }

  return getNotifyTimeFieldOptions(formDef, t).find((item) => item.field === field)?.label || field;
}

export function getNotifyWeekdayText(value?: number, t?: (key: string, params?: Record<string, any>) => string): string {
  const map: Record<number, string> = {
    0: t ? t("admin.notifyTime.sunday") : "周日",
    1: t ? t("admin.notifyTime.monday") : "周一",
    2: t ? t("admin.notifyTime.tuesday") : "周二",
    3: t ? t("admin.notifyTime.wednesday") : "周三",
    4: t ? t("admin.notifyTime.thursday") : "周四",
    5: t ? t("admin.notifyTime.friday") : "周五",
    6: t ? t("admin.notifyTime.saturday") : "周六",
  };

  return value == null ? "" : map[value] || "";
}

export function getNotifyWeekIndexText(value?: number, t?: (key: string, params?: Record<string, any>) => string): string {
  const map: Record<number, string> = {
    1: t ? t("admin.notifyTime.first") : "第一个",
    2: t ? t("admin.notifyTime.second") : "第二个",
    3: t ? t("admin.notifyTime.third") : "第三个",
    4: t ? t("admin.notifyTime.fourth") : "第四个",
    5: t ? t("admin.notifyTime.last") : "最后一个",
  };

  return value == null ? "" : map[value] || (t ? t("admin.notifyTime.first") : "第一个");
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

export function getNotifyScheduleSummary(notify: FormNotify, formDef: FormDef, t?: (key: string, params?: Record<string, any>) => string): string {
  const parts: string[] = [];

  if (notify.triggerMode === FormNotifyTriggerMode.CustomScheduled && notify.startTime) {
    const time = formatNotifyDateTime(notify.startTime);
    parts.push(t ? t("admin.notifyTime.startsAt", { time }) : `开始于 ${time}`);
  }

  if (notify.triggerMode === FormNotifyTriggerMode.TimeFieldScheduled && notify.timeField) {
    const name = getNotifyTimeFieldText(formDef, notify.timeField, t);
    parts.push(t ? t("admin.notifyTime.field", { name }) : `字段 ${name}`);
  }

  if (notify.endTime) {
    const time = formatNotifyDateTime(notify.endTime);
    parts.push(t ? t("admin.notifyTime.endsAt", { time }) : `结束于 ${time}`);
  }

  return parts.join("，");
}

export function getNotifyRepeatSummary(notify: FormNotify, t?: (key: string, params?: Record<string, any>) => string): string {
  if (notify.repeatType == null) {
    return "";
  }

  const map: Record<string, string> = {
    [TimerRepeatType.Once]: t ? t("admin.notifyTime.once") : "仅提醒一次",
    [TimerRepeatType.Daily]: t ? t("admin.notifyTime.daily") : "每天",
    [TimerRepeatType.Weekly]: t ? t("admin.notifyTime.weekly") : "每周",
    [TimerRepeatType.BiWeekly]: t ? t("admin.notifyTime.biWeekly") : "每两周",
    [TimerRepeatType.Monthly]: t ? t("admin.notifyTime.monthly") : "每月",
    [TimerRepeatType.Yearly]: t ? t("admin.notifyTime.yearly") : "每年",
  };

  if (notify.repeatType !== TimerRepeatType.Custom) {
    return map[notify.repeatType] || "";
  }

  const config = parseNotifyRepeatConfig(notify.repeatConfig);
  if (!config?.mode) {
    return t ? t("admin.notifyTime.custom") : "自定义";
  }

  if (config.mode === "weekly") {
    const count = Math.max(1, config.interval || 1);
    const days = (config.weekdays || []).map((value) => getNotifyWeekdayText(value, t)).filter(Boolean).join("、");
    const prefix = t ? t("admin.notifyTime.everyWeeks", { count }) : `每 ${count} 周`;
    return `${prefix}${days ? `，${days}` : ""}`;
  }

  if (config.mode === "monthly") {
    const count = Math.max(1, config.interval || 1);
    const prefix = t ? t("admin.notifyTime.everyMonths", { count }) : `每 ${count} 月`;
    if (config.monthlyMode === "relative") {
      return `${prefix}，${getNotifyWeekIndexText(config.weekIndex, t)}${getNotifyWeekdayText(config.weekday, t)}`;
    }

    const day = Math.max(1, config.monthDay || 1);
    return `${prefix}，${t ? t("admin.notifyTime.monthDay", { day }) : `第 ${day} 天`}`;
  }

  return t ? t("admin.notifyTime.custom") : "自定义";
}
