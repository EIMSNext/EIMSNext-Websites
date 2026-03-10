import { IConditionList } from "@eimsnext/components";
import { IDataSource, IDataSourceField } from "../type";
import { FieldType } from "@eimsnext/models";
import { AggregateFun } from "@eimsnext/services";

export interface IChartSetting {
  datasource: IDataSource;
  chartType?: ChartType;
  chartSubType?: string;
  dimension1?: IDimensionField[];
  dimension2?: IDimensionField[];
  metrics?: IMetricsField[];
  filter?: IConditionList;
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

export interface IChartConfig {
  id: ChartType;
  i18n: string;
  subType?: Array<any>;
  cssClass: string;
}

export function chartSettingValidate(setting: IChartSetting): boolean {
  if (!setting.datasource.id) return false;

  if (!setting.dimension1 || setting.dimension1.length == 0) return false;

  if (!setting.metrics || setting.metrics.length == 0) return false;

  return true;
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
    },
    {
      id: ChartType.HBar,
      i18n: "dash.hbar",
      subType: [{ id: "basic" }, { id: "stack", cssClass: "hbar-stack" }],
      cssClass: "hbar",
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
    },
  ];

  return configs;
}
