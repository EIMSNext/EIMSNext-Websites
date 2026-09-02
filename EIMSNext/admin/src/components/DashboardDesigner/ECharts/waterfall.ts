export interface WaterfallMetric {
  id: string;
  aggFun?: string;
  title?: string;
  label?: string;
}

export interface WaterfallSeriesOptions {
  metrics: WaterfallMetric[];
  data: Record<string, unknown[]>;
  isHorizontal: boolean;
  positiveColor: string;
  negativeColor: string;
  formatNumber: (value: number) => string;
  labelShow: boolean;
  labelLayout?: unknown;
}

const metricKey = (metric: WaterfallMetric) => `${metric.id}_${metric.aggFun || "count"}`;

export const buildWaterfallSeries = ({
  metrics,
  data,
  isHorizontal,
  positiveColor,
  negativeColor,
  formatNumber,
  labelShow,
  labelLayout,
}: WaterfallSeriesOptions): any[] => {
  const metricCount = metrics.length;

  return metrics.map((metric, metricIndex) => {
    const values = (data[metricKey(metric)] || []).map((value) => Number(value) || 0);
    let cumulative = 0;
    const changes = values.map((value, dataIndex) => {
      const start = cumulative;
      cumulative += value;
      return {
        value: [dataIndex, start, cumulative, value],
        itemStyle: { color: value < 0 ? negativeColor : positiveColor },
        tooltip: { valueFormatter: () => formatNumber(value) },
      };
    });

    return {
      name: metric.title || metric.label || metric.id,
      type: "custom",
      data: changes,
      encode: isHorizontal ? { x: [1, 2], y: 0, tooltip: 3 } : { x: 0, y: [1, 2], tooltip: 3 },
      renderItem: (_params: any, api: any) => {
        const category = api.value(0);
        const start = api.value(1);
        const end = api.value(2);
        const startPoint = api.coord(isHorizontal ? [start, category] : [category, start]);
        const endPoint = api.coord(isHorizontal ? [end, category] : [category, end]);
        const barLayout = api.barLayout({ count: metricCount, barCategoryGap: "30%", barGap: "20%" })[metricIndex];
        const barOffset = barLayout?.offset || 0;
        const barWidth = Math.max(1, barLayout?.width || 1);
        const shape = isHorizontal
          ? { x: Math.min(startPoint[0], endPoint[0]), y: startPoint[1] + barOffset, width: Math.abs(endPoint[0] - startPoint[0]), height: barWidth }
          : { x: startPoint[0] + barOffset, y: Math.min(startPoint[1], endPoint[1]), width: barWidth, height: Math.abs(endPoint[1] - startPoint[1]) };
        return { type: "rect", shape, style: { fill: api.visual("color") } };
      },
      label: {
        show: labelShow,
        position: isHorizontal ? "right" : "top",
        formatter: (params: any) => formatNumber(Number(params.value?.[3] ?? 0)),
      },
      labelLayout,
    };
  });
};
