import {
  FieldType,
  TimerOffsetDirection,
  TimerOffsetUnit,
  TimerRepeatType,
} from "@eimsnext/models";

export enum TriggerTimeMode {
  Custom = "custom",
  Field = "field",
}

export interface TriggerTimeFieldOption {
  field: string;
  label: string;
  format?: string;
  type?: FieldType | string;
}

export interface TriggerTimeCustomConfig {
  startTime?: number;
  endTime?: number;
}

export interface TriggerTimeFieldConfig {
  timeField?: string;
  fieldFormat?: string;
  direction?: TimerOffsetDirection;
  fixedTime?: string;
  offsetValue?: number;
  offsetUnit?: TimerOffsetUnit;
  endTime?: number;
}

export interface TriggerTimeSettingsValue {
  mode: TriggerTimeMode;
  repeatType?: TimerRepeatType;
  repeatConfig?: string;
  custom?: TriggerTimeCustomConfig;
  field?: TriggerTimeFieldConfig;
}

export interface CustomRepeatConfig {
  mode?: "weekly" | "monthly";
  interval?: number;
  weekdays?: number[];
  monthlyMode?: "day" | "relative";
  monthDay?: number;
  weekIndex?: number;
  weekday?: number;
}
