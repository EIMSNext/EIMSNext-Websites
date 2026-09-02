import * as echarts from "echarts/core";
import { BarChart, CustomChart, GaugeChart, LineChart, PieChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  DataZoomComponent,
  LegendComponent,
} from "echarts/components";
import { LabelLayout, UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

// 注册核心模块
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  DataZoomComponent,
  LegendComponent,
  BarChart,
  CustomChart,
  LineChart,
  PieChart,
  GaugeChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);

export default echarts;
