import assert from "node:assert/strict";
import { test } from "node:test";
import * as echarts from "echarts/core";
import { CustomChart } from "echarts/charts";
import { GridComponent, LegendComponent, TooltipComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import { buildWaterfallSeries } from "../src/components/DashboardDesigner/ECharts/waterfall";

echarts.use([CustomChart, GridComponent, LegendComponent, TooltipComponent, SVGRenderer]);

const metrics = [
  { id: "revenue", aggFun: "sum", label: "Revenue" },
  { id: "cost", aggFun: "sum", label: "Cost" },
];

const data = {
  revenue_sum: [100, -30, 50],
  cost_sum: [80, 20, -10],
};

test("buildWaterfallSeries preserves independent cumulative values for multiple metrics", () => {
  const series = buildWaterfallSeries({
    metrics,
    data,
    isHorizontal: false,
    positiveColor: "#00aa66",
    negativeColor: "#dd3344",
    formatNumber: (value) => String(value),
    labelShow: true,
  });

  assert.equal(series.length, 2);
  assert.deepEqual(series[0].data.map((item: any) => item.value), [
    [0, 0, 100, 100],
    [1, 100, 70, -30],
    [2, 70, 120, 50],
  ]);
  assert.deepEqual(series[1].data.map((item: any) => item.value), [
    [0, 0, 80, 80],
    [1, 80, 100, 20],
    [2, 100, 90, -10],
  ]);
  assert.notEqual(series[0].renderItem, series[1].renderItem);
  assert.equal(series[0].type, "custom");
  assert.equal(series[1].type, "custom");
});

test("ECharts SSR renders a multi-metric waterfall as visible SVG rectangles", () => {
  const series = buildWaterfallSeries({
    metrics,
    data,
    isHorizontal: false,
    positiveColor: "#00aa66",
    negativeColor: "#dd3344",
    formatNumber: (value) => String(value),
    labelShow: true,
  });
  const chart = echarts.init(null, undefined, {
    renderer: "svg",
    ssr: true,
    width: 640,
    height: 360,
  });

  chart.setOption({
    animation: false,
    xAxis: { type: "category", data: ["Q1", "Q2", "Q3"] },
    yAxis: { type: "value" },
    legend: { data: metrics.map((metric) => metric.label) },
    tooltip: { trigger: "axis" },
    series,
  });

  const svg = chart.renderToSVGString();
  chart.dispose();

  assert.match(svg, /<svg/);
  assert.match(svg, /<rect/);
  assert.match(svg, /#00aa66|rgb\(0, 170, 102\)/i);
  assert.match(svg, /#dd3344|rgb\(221, 51, 68\)/i);
  assert.match(svg, /Revenue/);
  assert.match(svg, /Cost/);
});
