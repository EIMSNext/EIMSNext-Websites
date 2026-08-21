<template>
  <div class="viewer-container">
    <el-popover
      :visible="showSort"
      :virtual-ref="sortRef"
      virtual-triggering
      :show-arrow="false"
      :offset="0"
      placement="bottom-end"
      width="500"
      :teleported="false"
      trigger="click"
      :destroy-on-close="true"
    >
      <DashSort
        :model-value="sortList"
        :sortFields="[]"
        @ok="setSort"
        @cancel="showSort = false"
      ></DashSort>
    </el-popover>
    <div v-if="showHeader" class="view-header">
      <div class="header-actions">
        <div v-if="!designerMode" class="header-btn no-drag" @click.stop="onRefresh">
          <et-icon icon="el-refresh" size="16px" />
        </div>
        <div v-if="setting.chartType !== ChartType.Indicator && setting.chartType !== ChartType.Progress" ref="sortRef" class="header-btn no-drag" @click.stop="onSort">
          <et-icon icon="el-sort" size="16px" />
        </div>
        <slot name="header-actions"></slot>
      </div>
      <div class="header-title" :title="title">{{ title }}</div>
    </div>

    <template v-if="chartOpts">
      <EChartsContainer :options="chartOpts" class="viewer-chart"></EChartsContainer>
    </template>
    <template v-else>
      <el-empty class="et-dash-empty">
        <div class="empty-wrapper">
          <i class="x-icon iconfont-fx-pc icon-info-o"></i>
          <div class="empty-text">{{ t("admin.dashItem.invalidConfig") }}</div>
        </div>
      </el-empty>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import echarts from "@/plugins/echarts";
import { chartSettingValidate, ChartType, getChartSort, IChartSetting } from "./type";
import { AggCalcRequest, AggPreviewRequest, AggregateFun, aggregateService } from "@eimsnext/services";
import { convertToFieldArray } from "@eimsnext/utils";
import { DashboardItemDef } from "@eimsnext/models";
import { IConditionList, ISortItem, ISortList, toDynamicFilter } from "@eimsnext/components";
import DashSort from "../components/DashSort.vue";
import { useI18n } from "vue-i18n";
import { usePublicHttp } from "@/views/public/shared";

const { t } = useI18n();

defineOptions({
  name: "EChartsViewer",
});

const props = withDefaults(
  defineProps<{
    setting: IChartSetting;
    title: string;
    showHeader?: boolean;
    designerMode?: boolean;
    externalFilter?: IConditionList;
    isPublic?: boolean;
    publicToken?: string;
    itemDef?: DashboardItemDef;
  }>(),
  {
    showHeader: true,
    designerMode: false,
  }
);

const chartOpts = ref<echarts.EChartsCoreOption>();
const publicHttp = usePublicHttp();
let requestVersion = 0;

watch(
  () => props.publicToken,
  (token) => {
    publicHttp.token.value = token || null;
  },
  { immediate: true },
);

const formatNumber = (value: number, decimalPlaces = 0) => {
  if (!Number.isFinite(value)) return "-";
  const places = Number.isInteger(decimalPlaces) && decimalPlaces >= 0 && decimalPlaces <= 6 ? decimalPlaces : 0;
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: places, maximumFractionDigits: places }).format(value);
};

const metricKey = (metric: { id: string; aggFun?: AggregateFun }) => `${metric.id}_${metric.aggFun || AggregateFun.Count}`;
const firstNumericValue = (values: any[] | undefined) => {
  const value = Number(values?.[0]);
  return Number.isFinite(value) ? value : 0;
};

const getChartOpts = async (setting: IChartSetting) => {
  const currentRequest = ++requestVersion;
  if (!chartSettingValidate(setting)) {
    chartOpts.value = undefined;
    return null;
  }

  let chartType = setting.chartType || "";
  let chartSubType = setting.chartSubType || chartType;
  let opt: any;
  let aggRequest: AggCalcRequest = {
    itemId: props.itemDef?.id || "",
    filter: props.externalFilter ? toDynamicFilter(props.externalFilter) : undefined,
    sort: getChartSort(setting),
  };
  if (!aggRequest.itemId) {
    chartOpts.value = undefined;
    return null;
  }
  const previewRequest: AggPreviewRequest = { ...aggRequest, details: JSON.stringify(setting) };
  const aggResult = props.designerMode
    ? await aggregateService.preview(previewRequest)
    : props.isPublic && props.publicToken
    ? await publicHttp.api.post<any[]>("/aggregate/calucate", aggRequest)
    : await aggregateService.calucate(aggRequest);
  if (currentRequest !== requestVersion) return null;
  let ds = convertToFieldArray(aggResult);
  switch (chartType) {
    case ChartType.Indicator: {
      const metric = setting.metrics![0];
      const value = firstNumericValue(ds[metricKey(metric)]);
      const options = setting.indicator || {};
      opt = {
        title: options.showName === false ? undefined : { text: metric.title || metric.label || metric.id, left: "center", top: "18%" },
        series: [{ type: "gauge", startAngle: 90, endAngle: -270, radius: "76%", pointer: { show: false }, progress: { show: false }, itemStyle: { color: "#6A83FC" }, axisLine: { lineStyle: { width: 0 } }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false }, detail: { valueAnimation: true, fontSize: 32, offsetCenter: [0, "8%"], color: "#6A83FC", formatter: () => formatNumber(value, options.decimalPlaces || 0) }, data: [{ value }] }],
      };
      chartOpts.value = applyChartTheme(opt);
      break;
    }
    case ChartType.Progress: {
      const actualMetric = setting.metrics![0];
      const actual = firstNumericValue(ds[metricKey(actualMetric)]);
      const progress = setting.progress;
      const target = progress?.targetType === "metric" && progress.targetMetric
        ? firstNumericValue(ds[metricKey(progress.targetMetric)])
        : Number(progress?.targetValue);
      if (!Number.isFinite(target) || target <= 0) {
        chartOpts.value = undefined;
        break;
      }
      const percent = actual / target * 100;
      const options = progress || {};
      const style = options.style || "ring";
      const labelParts = [
        options.showActual ? formatNumber(actual, options.decimalPlaces || 0) : undefined,
        options.showTarget ? formatNumber(target, options.decimalPlaces || 0) : undefined,
        options.showPercent === false ? undefined : `${formatNumber(percent, options.decimalPlaces || 0)}%`,
      ].filter(Boolean);
      const isSemi = style === "semi";
      opt = {
        title: options.showName === false ? undefined : { text: actualMetric.title || actualMetric.label || actualMetric.id, left: "center", top: "2%" },
        series: [{ type: "gauge", startAngle: isSemi ? 180 : 90, endAngle: isSemi ? 0 : -270, center: isSemi ? ["50%", "65%"] : ["50%", "50%"], radius: isSemi ? "90%" : "72%", pointer: { show: false }, progress: { show: true, width: style === "thin" ? 7 : 14, roundCap: true, itemStyle: { color: "#6A83FC" } }, axisLine: { lineStyle: { width: style === "thin" ? 7 : 14, color: [[1, isDark.value ? "#374151" : "#E6EAF2"]] } }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false }, detail: { valueAnimation: true, fontSize: 24, offsetCenter: isSemi ? [0, "18%"] : [0, "8%"], color: "#6A83FC", formatter: () => labelParts.join(" / ") }, data: [{ value: Math.min(100, Math.max(0, percent)) }] }],
      };
      chartOpts.value = applyChartTheme(opt);
      break;
    }
    case ChartType.VBar:
    case ChartType.HBar: {
      const bar = setting.bar || {};
      const categories = ds[setting.dimension1![0].id] || [];
      const isHorizontal = chartType === ChartType.HBar;
      const labelLayout = bar.labelOverlap === "hide"
        ? { hideOverlap: true }
        : bar.labelOverlap === "stagger"
          ? (params: any) => (isHorizontal ? { dy: params.dataIndex % 2 ? 14 : 0 } : { dx: params.dataIndex % 2 ? 14 : 0 })
          : { moveOverlap: isHorizontal ? "shiftY" : "shiftX" };
      const series = setting.metrics!.map((metric) => ({
        name: metric.title || metric.label || metric.id,
        type: "bar",
        data: ds[metricKey(metric)] || [],
        stack: chartSubType === "stack" ? "total" : undefined,
        label: { show: bar.showDataLabel ?? false, position: chartType === ChartType.HBar ? "right" : "top" },
        labelLayout,
      }));
      if (chartSubType === "waterfall") {
        const colors = ["#66b1ff", "#73d13d", "#ff4d4f", "#73d13d", "#ff7a45"];
        series.forEach((item: any) => {
          item.data = item.data.map((value: number, index: number) => ({ value, itemStyle: { color: colors[index % colors.length] } }));
        });
      }
      const categoryAxis = {
        type: "category",
        data: categories,
        axisLabel: {
          rotate: bar.categoryAxisLabelMode === "tilt" ? 35 : bar.categoryAxisLabelMode === "vertical" ? 90 : 0,
          interval: bar.showAllCategoryLabels ? 0 : "auto",
        },
      };
      const valueAxis = {
        type: "value",
        name: bar.valueAxisTitle || undefined,
        min: bar.valueAxisMin ?? undefined,
        max: bar.valueAxisMax ?? undefined,
      };
      opt = {
        xAxis: isHorizontal ? valueAxis : categoryAxis,
        yAxis: isHorizontal ? categoryAxis : valueAxis,
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        legend: setting.metrics!.length > 1 ? { data: series.map((item: any) => item.name) } : undefined,
        dataZoom: bar.showDataZoom
          ? isHorizontal ? [{ type: "inside", yAxisIndex: 0 }, { type: "slider", yAxisIndex: 0 }] : [{ type: "inside" }, { type: "slider" }]
          : undefined,
        series,
      };
      chartOpts.value = applyChartTheme(opt);
      break;
    }
    case ChartType.Line: // 折线图
      const line = setting.line || {};
      const lineXAxis = ds[setting.dimension1![0].id] || [];
      const lineSeries = setting.metrics!.map((metric) => ({
        name: metric.title || metric.label || metric.id,
        type: "line",
        data: ds[metricKey(metric)] || [],
        smooth: line.smooth ?? chartSubType === "smooth",
        showSymbol: line.showSymbol ?? true,
        label: { show: line.showDataLabel ?? false },
        labelLayout: line.labelOverlap === "hide"
          ? { hideOverlap: true }
          : line.labelOverlap === "stagger"
            ? (params: any) => ({ dy: params.dataIndex % 2 ? 14 : 0 })
            : { moveOverlap: "shiftY" },
      }));
      opt = {
        xAxis: { type: "category", data: lineXAxis, axisLabel: { rotate: line.xAxisLabelMode === "tilt" ? 35 : line.xAxisLabelMode === "vertical" ? 90 : 0, interval: line.showAllLabels ? 0 : "auto" } },
        yAxis: { type: "value", name: line.yAxisTitle || undefined, min: line.yAxisMin ?? undefined, max: line.yAxisMax ?? undefined },
        tooltip: { trigger: "axis" },
        legend: lineSeries.length > 1 ? { data: lineSeries.map((series: any) => series.name) } : undefined,
        dataZoom: line.showDataZoom ? [{ type: "inside" }, { type: "slider" }] : undefined,
        series: lineSeries,
      };
      if (chartSubType == "stack") {
        opt.series.forEach((series: any) => { series.stack = "total"; });
      }
      if (chartSubType == "area") {
        opt.series.forEach((series: any) => { series.areaStyle = { color: "rgba(25,183,207,0.2)" }; });
      }
      if (chartSubType == "smooth") opt.series.forEach((series: any) => { series.smooth = true; });
      if (chartSubType == "step") {
        opt.series.forEach((series: any) => { series.step = "start"; });
      }

      chartOpts.value = applyChartTheme(opt);
      break;
    case ChartType.Pie: // 饼图（无需x/y轴，避免多余配置导致报错）
      let serie = { type: "pie", radius: "50%", data: [] as any[] };
      const dimId = setting.dimension1![0].id;
      const metricId = `${setting.metrics![0].id}_${setting.metrics![0].aggFun || AggregateFun.Count}`;
      aggResult.forEach((r: any) => {
        serie.data.push({ name: r[dimId], value: r[metricId] });
      });

      opt = {
        tooltip: { trigger: "item" },
        series: [serie],
        // series: [{
        //     type: 'pie',
        //     radius: '50%',
        //     data: [
        //         { name: 'A', value: 5 },
        //         { name: 'B', value: 20 },
        //         { name: 'C', value: 36 }
        //     ]
        // }]
      };
      if (chartSubType == "circle") {
        opt.series[0].radius = ["40%", "70%"];
        opt.series[0]["center"] = ["50%", "50%"];
      }
      if (chartSubType == "area") {
        opt.series[0].radius = ["10%", "80%"];
        opt.series[0]["center"] = ["50%", "50%"];
        opt.series[0]["roseType"] = "area";
      }
      chartOpts.value = applyChartTheme(opt);
      break;
    default:
      chartOpts.value = undefined;
      break;
  }
};

const sortRef = ref();
const showSort = ref(false);
const sortList = ref<ISortList>({
  items: [],
});

const emit = defineEmits(["refresh", "sort"]);
const onRefresh = async () => {
  await getChartOpts(props.setting);
};
const onSort = () => {
  showSort.value = true;
};
const setSort = (sort: ISortList) => {
  sortList.value = sort;
  showSort.value = false;
  props.setting.sort = sort;
};

const isDark = ref(typeof document !== "undefined" && document.documentElement.classList.contains("dark"));

const applyChartTheme = (opt: echarts.EChartsCoreOption | undefined): echarts.EChartsCoreOption | undefined => {
  if (!opt) return opt;
  const textColor = isDark.value ? "#E5EAF3" : "#303133";
  const axisColor = isDark.value ? "#6B7280" : "#DCDFE6";
  const splitLineColor = isDark.value ? "#374151" : "#EBEEF5";
  const tooltipBg = isDark.value ? "rgba(50,50,50,0.95)" : "rgba(255,255,255,0.95)";
  const tooltipText = isDark.value ? "#E5EAF3" : "#303133";

  return {
    backgroundColor: "transparent",
    textStyle: { color: textColor },
    title: { textStyle: { color: textColor }, subtextStyle: { color: textColor } },
    legend: { textStyle: { color: textColor } },
    tooltip: {
      backgroundColor: tooltipBg,
      borderColor: tooltipBg,
      textStyle: { color: tooltipText },
    },
    xAxis: {
      axisLine: { lineStyle: { color: axisColor } },
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: splitLineColor } },
    },
    yAxis: {
      axisLine: { lineStyle: { color: axisColor } },
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: splitLineColor } },
    },
    ...opt,
  };
};

watch(
  () => props.setting,
  async (newVal) => {
    if (newVal) {
      sortList.value = newVal.sort || { items: [] };

      await getChartOpts(newVal);
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

watch(
  () => props.externalFilter,
  async () => {
    if (props.setting) await getChartOpts(props.setting);
  },
  { deep: true }
);

watch(isDark, async () => {
  if (props.setting) await getChartOpts(props.setting);
});

onBeforeUnmount(() => {
  requestVersion++;
});

let darkObserver: MutationObserver | undefined;
onMounted(() => {
  if (typeof document === "undefined") return;
  darkObserver = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains("dark");
  });
  darkObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
});

onUnmounted(() => {
  darkObserver?.disconnect();
});
</script>

<style lang="scss" scoped>
.viewer-container {
  width: 100%;
  height: 100%;
}

.view-header {
  height: var(--et-size-30);
  line-height: var(--et-line-height-30);
  padding: var(--et-space-20);
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: var(--et-z-base);
  font-size: var(--et-font-size-14);
  color: var(--et-text-primary);

  .header-title {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header-actions {
    align-items: center;
    background: transparent;
    color: var(--et-text-secondary);
    cursor: pointer;
    display: flex;
    float: right;

    .header-btn {
      align-items: center;
      display: inline-flex;
      height: var(--et-size-30);
      justify-content: center;
      width: var(--et-size-30);
    }
  }
}

.viewer-chart {
  margin-top: var(--et-space-20);
}
</style>
