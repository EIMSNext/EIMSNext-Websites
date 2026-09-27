import { TimerOffsetDirection, TimerOffsetUnit, TimerRepeatType } from "./formNotify";

/**
 * 数据流触发类型。
 */
export enum EventFlowTriggerKind {
  Form = "form",
  Schedule = "schedule",
  Http = "http",
}

/**
 * 定时触发时间源类型。
 */
export enum EventFlowScheduleSourceType {
  Custom = "custom",
  FormField = "formField",
}

/**
 * 数据流HTTP样例字段。
 */
export interface EventFlowHttpSampleField {
  key: string;
  label: string;
  type: string;
  sampleValue?: string;
}

/**
 * 数据流HTTP触发设置。
 */
export interface EventFlowHttpTriggerSetting {
  allowedIps?: string[];
  responseEnabled?: boolean;
  responseStatusCode?: number;
  responseContentType?: string;
  responseBody?: string;
  sampleCapturedAt?: number;
  sampleFields?: EventFlowHttpSampleField[];
}

/**
 * 数据流定时触发设置。
 */
export interface EventFlowTimeTriggerSetting {
  sourceType: EventFlowScheduleSourceType;
  startTime?: number;
  endTime?: number;
  timeField?: string;
  fieldFormat?: string;
  direction?: TimerOffsetDirection;
  fixedTime?: string;
  offsetValue?: number;
  offsetUnit?: TimerOffsetUnit;
  repeatType?: TimerRepeatType;
  repeatConfig?: string;
}
