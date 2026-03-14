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

export enum ChartType {
  VBar = "vbar", //柱状图
  HBar = "hbar", //条形图
  Line = "line", //折线图
  Pie = "pie", //饼图
}

export interface ILimitation {
  dimension?: number;
  metric?: number;
}

export interface IChartConfig {
  id: ChartType;
  i18n: string;
  subType?: Array<any>;
  cssClass: string;
  limitation: ILimitation;
}

export function chartSettingValidate(setting: IChartSetting): boolean {
  if (!setting.datasource.id) return false;

  if (!setting.dimension1 || setting.dimension1.length == 0) return false;

  if (!setting.metrics || setting.metrics.length == 0) return false;

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
      i18n: "dash.vbar",
      subType: [
        { id: "basic" },
        { id: "stack", cssClass: "vbar-stack" },
        { id: "waterfall", cssClass: "vbar-waterfall" },
      ],
      cssClass: "vbar",
      limitation: { dimension: 1, metric: 1 },
    },
    {
      id: ChartType.HBar,
      i18n: "dash.hbar",
      subType: [{ id: "basic" }, { id: "stack", cssClass: "hbar-stack" }],
      cssClass: "hbar",
      limitation: { dimension: 1, metric: 1 },
    },
    {
      id: ChartType.Line,
      i18n: "dash.line",
      subType: [
        { id: "basic" },
        { id: "stack", cssClass: "" },
        { id: "area", cssClass: "line-area" },
        { id: "smooth", cssClass: "" },
        { id: "step", cssClass: "" },
      ],
      cssClass: "line",
      limitation: { dimension: 1, metric: 1 },
    },
    {
      id: ChartType.Pie,
      i18n: "dash.pie",
      subType: [
        { id: "basic" },
        { id: "circle", cssClass: "pie-circle" },
        { id: "area", cssClass: "" },
      ],
      cssClass: "pie",
      limitation: { dimension: 1, metric: 1 },
    },
  ];

  return configs;
}
