import { Ref, onMounted, onUnmounted, watch } from "vue";
import { useDebounceFn, useResizeObserver } from "@vueuse/core";
import echarts from "@/plugins/echarts";

interface EchartsConfig {
  theme?: "light" | "dark" | string;
  autoResize?: boolean;
  animation?: boolean;
  resizeDebounce?: number;
}

export const useEcharts = (
  elRef: Ref<HTMLDivElement | null>,
  options: echarts.EChartsCoreOption,
  config: EchartsConfig = {}
): {
  chart: echarts.ECharts | null;
  initChart: (newOptions: echarts.EChartsCoreOption) => void;
  resize?: () => void;
} => {
  const { autoResize = true, animation = true, resizeDebounce = 300 } = config;

  let chart: echarts.ECharts | null = null;

  // 初始化图表
  const initChart = (newOptions = options) => {
    if (!elRef.value) return;
    if (chart) disposeChart();

    chart = echarts.init(elRef.value);
    chart.setOption({
      ...newOptions,
      animation,
    });
  };

  // 销毁图表
  const disposeChart = () => {
    if (!chart) return;
    chart.dispose();
    chart = null;
  };

  // 响应式调整
  const resizeHandler = useDebounceFn(() => {
    chart?.resize();
  }, resizeDebounce);

  onMounted(() => {
    initChart();
    if (autoResize) {
      useResizeObserver(elRef, resizeHandler);
    }
  });

  onUnmounted(() => {
    disposeChart();
  });

  return {
    chart,
    initChart,
    resize: resizeHandler,
  };
};
