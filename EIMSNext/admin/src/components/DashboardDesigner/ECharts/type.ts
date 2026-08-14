import { IConditionList, ISortList } from "@eimsnext/components";
import { IDataSource, IDataSourceField } from "../type";
import { FieldType } from "@eimsnext/models";
import { AggregateFun, IAgSortItem, SortDirection } from "@eimsnext/services";

export interface IChartSetting {
  datasource: IDataSource;
  chartType?: ChartType;
  chartSubType?: string;
  dimension1?: IDimensionField[];
  dimension2?: IDimensionField[];
  metrics?: IMetricsField[];
  filter?: IConditionList;
  sort?: ISortList;
  takeEnable?: boolean;
  take?: number;
  indicator?: IIndicatorChartOptions;
  progress?: IProgressChartOptions;
  line?: ILineChartOptions;
  bar?: IBarChartOptions;
}

export interface IDimensionField {
  id: string;
  type: FieldType;
  label?: string;
  title?: string;
}

export interface IMetricsField {
  id: string;
  type: FieldType;
  label?: string;
  title?: string;
  aggFun?: AggregateFun;
}

export interface INumberFormatOptions {
  decimalPlaces?: number;
}

export interface IIndicatorChartOptions extends INumberFormatOptions {
  showName?: boolean;
}

export type ProgressTargetType = "metric" | "value";
export type ProgressStyle = "ring" | "semi" | "thin";
export interface IProgressChartOptions extends INumberFormatOptions {
  targetType?: ProgressTargetType;
  targetMetric?: IMetricsField;
  targetValue?: number;
  showName?: boolean;
  style?: ProgressStyle;
  showActual?: boolean;
  showTarget?: boolean;
  showPercent?: boolean;
}

export type AxisLabelMode = "horizontal" | "tilt" | "vertical";
export type LineXAxisLabelMode = AxisLabelMode;
export type LineLabelOverlap = "adjust" | "hide" | "stagger";
export interface ILineChartOptions {
  smooth?: boolean;
  showSymbol?: boolean;
  xAxisLabelMode?: LineXAxisLabelMode;
  showAllLabels?: boolean;
  showDataZoom?: boolean;
  yAxisTitle?: string;
  yAxisMin?: number | null;
  yAxisMax?: number | null;
  showDataLabel?: boolean;
  labelOverlap?: LineLabelOverlap;
}

export interface IBarChartOptions {
  categoryAxisLabelMode?: AxisLabelMode;
  showAllCategoryLabels?: boolean;
  showDataZoom?: boolean;
  valueAxisTitle?: string;
  valueAxisMin?: number | null;
  valueAxisMax?: number | null;
  showDataLabel?: boolean;
  labelOverlap?: LineLabelOverlap;
}

export enum ChartType {
  VBar = "vbar", //柱状图
  HBar = "hbar", //条形图
  Line = "line", //折线图
  Pie = "pie", //饼图
  Indicator = "indicator", //指标图
  Progress = "progress", //进度图
}

export interface ILimitation {
  dimension?: ILimitOption;
  metric?: ILimitOption;
}

export interface ILimitOption {
  type: LimitType;
  value: ILimitValue;
}
export enum LimitType {
  Strict = 0,
  Range = 1,
}
export interface ILimitValue {
  value1: number;
  value2?: number;
}

export interface IChartConfig {
  id: ChartType;
  i18n: string;
  subType?: Array<any>;
  cssClass: string;
  limitation: ILimitation;
  limitationDescription?: string;
}

export function chartSettingValidate(setting: IChartSetting): boolean {
  if (!setting.datasource?.id) return false;

  const decimalPlacesValid = (value?: number) => value === undefined || (Number.isInteger(value) && value >= 0 && value <= 6);
  const axisValueValid = (value?: number | null) => value === undefined || value === null || Number.isFinite(value);
  const axisRangeValid = (min?: number | null, max?: number | null) => {
    if (!axisValueValid(min) || !axisValueValid(max)) return false;
    return min == null || max == null || min <= max;
  };

  if (setting.chartType === ChartType.Indicator) {
    return !setting.dimension1?.length && !setting.dimension2?.length && setting.metrics?.length === 1 && !!setting.metrics[0]?.id && decimalPlacesValid(setting.indicator?.decimalPlaces);
  }

  if (setting.chartType === ChartType.Progress) {
    if (setting.dimension1?.length || setting.dimension2?.length || setting.metrics?.length !== 1 || !setting.metrics[0]?.id || !decimalPlacesValid(setting.progress?.decimalPlaces)) return false;
    const progress = setting.progress;
    return progress?.targetType === "metric"
      ? !!progress.targetMetric?.id
      : progress?.targetType === "value" && Number(progress.targetValue) > 0;
  }

  if (!setting.dimension1 || setting.dimension1.length !== 1 || setting.dimension2?.length) return false;

  if (!setting.metrics || setting.metrics.length == 0) return false;

  if (!setting.metrics.every((metric) => !!metric.id)) return false;
  if (setting.chartType === ChartType.Line) {
    const line = setting.line;
    if (!axisRangeValid(line?.yAxisMin, line?.yAxisMax)) return false;
  }
  if (setting.chartType === ChartType.VBar || setting.chartType === ChartType.HBar) {
    if (!axisRangeValid(setting.bar?.valueAxisMin, setting.bar?.valueAxisMax)) return false;
  }

  return true;
}

export function getChartSort(setting: IChartSetting) {
  let sorts: IAgSortItem[] = [];
  let dims = [...(setting.dimension1 || []), ...(setting.dimension2 || [])];
  let metrics = [...(setting.metrics || [])];

  if (setting.sort && setting.sort.items.length > 0) {
    setting.sort.items.forEach((sort) => {
      if (sort.sort != SortDirection.Unset) {
        let dim = dims.find((x) => x.id == sort.field.field);
        if (dim) {
          sorts.push({ id: sort.field.field, type: sort.field.type, dir: sort.sort });
          return;
        }

        let metric = metrics.find((x) => x.id == sort.field.field);
        if (metric) {
          sorts.push({
            id: `${metric.id}_${metric.aggFun ?? "count"}`,
            type: FieldType.Number,
            dir: sort.sort,
          });
          return;
        }
      }
    });
  }

  return sorts;
}

export function getChartConfigs() {
  let configs: IChartConfig[] = [
    {
      id: ChartType.VBar,
      i18n: "dash.chart.vbar",
      subType: [
        { id: "basic" },
        { id: "stack", cssClass: "vbar-stack" },
        { id: "waterfall", cssClass: "vbar-waterfall" },
      ],
      cssClass: "vbar",
      limitation: {
        dimension: { type: LimitType.Strict, value: { value1: 1 } },
        metric: { type: LimitType.Range, value: { value1: 1 } },
      },
    },
    {
      id: ChartType.HBar,
      i18n: "dash.chart.hbar",
      subType: [{ id: "basic" }, { id: "stack", cssClass: "hbar-stack" }],
      cssClass: "hbar",
      limitation: {
        dimension: { type: LimitType.Strict, value: { value1: 1 } },
        metric: { type: LimitType.Range, value: { value1: 1 } },
      },
    },
    {
      id: ChartType.Line,
      i18n: "dash.chart.line",
      subType: [
        { id: "basic" },
        { id: "stack", cssClass: "" },
        { id: "area", cssClass: "line-area" },
        { id: "smooth", cssClass: "" },
        { id: "step", cssClass: "" },
      ],
      cssClass: "line",
      limitation: {
        dimension: { type: LimitType.Strict, value: { value1: 1 } },
        metric: { type: LimitType.Range, value: { value1: 1 } },
      },
    },
    {
      id: ChartType.Pie,
      i18n: "dash.chart.pie",
      subType: [
        { id: "basic" },
        { id: "circle", cssClass: "pie-circle" },
        { id: "area", cssClass: "" },
      ],
      cssClass: "pie",
      limitation: {
        dimension: { type: LimitType.Strict, value: { value1: 1 } },
        metric: { type: LimitType.Strict, value: { value1: 1 } },
      },
    },
    {
      id: ChartType.Indicator,
      i18n: "dash.chart.indicator",
      cssClass: "indicator",
      limitation: {
        dimension: { type: LimitType.Strict, value: { value1: 0 } },
        metric: { type: LimitType.Strict, value: { value1: 1 } },
      },
    },
    {
      id: ChartType.Progress,
      i18n: "dash.chart.progress",
      cssClass: "progress",
      limitationDescription: "dash.limitation.progress",
      limitation: {
        dimension: { type: LimitType.Strict, value: { value1: 0 } },
        metric: { type: LimitType.Strict, value: { value1: 1 } },
      },
    },
  ];

  return configs;
}

export function getLimitationDesc(t: any, limitation?: ILimitation) {
  if (!limitation) return "";

  let limits: string[] = [];

  if (limitation.dimension) {
    if (limitation.dimension.type == LimitType.Range) {
      if (limitation.dimension.value.value2)
        limits.push(
          t("dash.limitation.dimensionRange", [
            limitation.dimension.value.value1,
            limitation.dimension.value.value2,
          ])
        );
      else limits.push(t("dash.limitation.moreDimensions", [limitation.dimension.value.value1]));
    } else limits.push(t("dash.limitation.dimension", [limitation.dimension.value.value1]));
  }

  if (limitation.metric) {
    if (limitation.metric.type == LimitType.Range) {
      if (limitation.metric.value.value2)
        limits.push(
          t("dash.limitation.metricRange", [
            limitation.metric.value.value1,
            limitation.metric.value.value2,
          ])
        );
      else limits.push(t("dash.limitation.moreMetrics", [limitation.metric.value.value1]));
    } else limits.push(t("dash.limitation.metric", [limitation.metric.value.value1]));
  }

  return limits.join(", ");
}
