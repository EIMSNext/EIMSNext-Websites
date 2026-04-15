<template>
  <div class="viewer-container">
    <el-popover
      :visible="showSort"
      :virtual-ref="sortRef"
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
        <div ref="sortRef" class="header-btn no-drag" @click.stop="onSort">
          <et-icon icon="el-sort" size="16px" />
        </div>
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
          <div class="empty-text">组件配置异常</div>
        </div>
      </el-empty>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import echarts from "@/plugins/echarts";
import { chartSettingValidate, ChartType, getChartSort, IChartSetting } from "./type";
import { AggCalcRequest, AggregateFun, aggregateService } from "@eimsnext/services";
import { convertToFieldArray } from "@eimsnext/utils";
import { ISortItem, ISortList, toDynamicFilter } from "@eimsnext/components";
import DashSort from "../components/DashSort.vue";

defineOptions({
  name: "EChartsViewer",
});

const props = withDefaults(
  defineProps<{
    setting: IChartSetting;
    title: string;
    showHeader?: boolean;
    designerMode?: boolean;
  }>(),
  {
    showHeader: true,
    designerMode: false,
  }
);

const chartOpts = ref<echarts.EChartsCoreOption>();

const getChartOpts = async (setting: IChartSetting) => {
  if (!chartSettingValidate(setting)) return null;

  let chartType = setting.chartType || "";
  let chartSubType = setting.chartSubType || chartType;
  let opt: any;
  let aggRequest: AggCalcRequest = {
    dataSource: setting.datasource,
    dimensions: [...(setting.dimension1 || []), ...(setting.dimension2 || [])],
    metrics: [...(setting.metrics || [])],
    filter: setting.filter ? toDynamicFilter(setting.filter) : undefined,
    sort: getChartSort(setting),
    take: setting.takeEnable ? setting.take : -1,
  };
  let aggResult = await aggregateService.calucate(aggRequest);
  let ds = convertToFieldArray(aggResult);
  switch (chartType) {
    case ChartType.VBar: // 垂直柱状图
      opt = {
        xAxis: { type: "category", data: ds[setting.dimension1![0].id] },
        yAxis: { type: "value" },
        series: [
          {
            type: "bar",
            data: ds[
              `${setting.metrics![0].id}_${setting.metrics![0].aggFun || AggregateFun.Count}`
            ],
          },
        ],
      };

      if (chartSubType == "stack") {
        let legend: any[] = [];
        let series: any[] = [];
        setting.metrics!.forEach((m) => {
          legend.push(m.title);
          series.push({
            name: m.title,
            type: "bar",
            stack: "total",
            data: ds[`${m.id}_${m.aggFun || AggregateFun.Count}`],
          });
        });
        opt = {
          xAxis: { type: "category", data: ds[setting.dimension1![0].id] },
          yAxis: { type: "value" },
          tooltip: { trigger: "axis", axisPointer: { type: "shadow" } }, // 轴提示优化
          legend: { data: legend },
          series: series,
          // legend: { data: ['系列1', '系列2', '系列3'] }, // 堆叠系列图例
          // series: [
          //     { name: '系列1', type: 'bar', stack: 'total', data: [5, 20, 36, 10, 15] },
          //     { name: '系列2', type: 'bar', stack: 'total', data: [3, 15, 22, 8, 10] },
          //     { name: '系列3', type: 'bar', stack: 'total', data: [2, 8, 15, 5, 6] }
          // ]
        };
      }

      if (chartSubType == "waterfall") {
        let colors = ["#66b1ff", "#73d13d", "#ff4d4f", "#73d13d", "#ff7a45"];
        let legend: any[] = [];
        let series: any[] = [];
        setting.metrics!.forEach((m) => {
          legend.push(m.title);
          let serie = { name: m.title, type: "bar", data: [] as any[] };
          ds[`${m.id}_${m.aggFun || AggregateFun.Count}`].forEach((v, i) => {
            serie.data.push({ value: v, itemStyle: { color: colors[i] } });
          });
          series.push(serie);
        });

        opt = {
          xAxis: { type: "category", data: ds[setting.dimension1![0].id] },
          yAxis: { type: "value" },
          tooltip: { trigger: "axis" },
          legend: { data: legend },
          series: series,
          // series: [
          //     {
          //         name: '数值',
          //         type: 'bar',
          //         data: [
          //             { value: 100, itemStyle: { color:  } }, // 初始值
          //             { value: 50, itemStyle: { color:  } },  // 新增（正）
          //             { value: -30, itemStyle: { color:  } }, // 减少（负）
          //             { value: 20, itemStyle: { color:  } },  // 调整（正）
          //             {
          //                 value: 140,
          //                 itemStyle: { color:  },
          //                 label: { show: true, position: 'top' } // 汇总项显示数值
          //             }
          //         ]
          //     }
          // ]
        };
      }

      chartOpts.value = opt;
      break;
    case ChartType.HBar: // 水平柱状图（x/y轴类型互换）
      opt = {
        xAxis: { type: "value" },
        yAxis: { type: "category", data: ds[setting.dimension1![0].id] },
        series: [
          {
            type: "bar",
            data: ds[
              `${setting.metrics![0].id}_${setting.metrics![0].aggFun || AggregateFun.Count}`
            ],
          },
        ],
      };
      if (chartSubType == "stack") {
        let legend: any[] = [];
        let series: any[] = [];
        setting.metrics!.forEach((m) => {
          legend.push(m.title);
          series.push({
            name: m.title,
            type: "bar",
            stack: "total",
            data: ds[`${m.id}_${m.aggFun || AggregateFun.Count}`],
          });
        });

        opt = {
          xAxis: { type: "value" },
          yAxis: { type: "category", data: ds[setting.dimension1![0].id] },
          tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
          legend: { data: legend },
          series: series,
        };
      }
      chartOpts.value = opt;
      break;
    case ChartType.Line: // 折线图
      opt = {
        xAxis: { type: "category", data: ds[setting.dimension1![0].id] },
        yAxis: { type: "value" },
        series: [
          {
            type: "line",
            data: ds[
              `${setting.metrics![0].id}_${setting.metrics![0].aggFun || AggregateFun.Count}`
            ],
          },
        ],
      };
      if (chartSubType == "stack") {
        opt.series[0]["stack"] = "total";
      }
      if (chartSubType == "area") {
        opt.series[0]["areaStyle"] = { color: "rgba(25,183,207,0.2)" };
      }
      if (chartSubType == "smooth") {
        opt.series[0]["smooth"] = true;
      }
      if (chartSubType == "step") {
        opt.series[0]["step"] = "start";
      }

      chartOpts.value = opt;
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
      chartOpts.value = opt;
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
    background: transparent;
    color: var(--et-text-secondary);
    cursor: pointer;
    float: right;

    .header-btn {
      width: var(--et-size-30);
      height: var(--et-size-30);
      display: inline-block;
    }
  }
}

.viewer-chart {
  margin-top: var(--et-space-20);
}
</style>
