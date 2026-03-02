<template>
    <EChartsContainer v-if="chartOpts" :options="chartOpts"></EChartsContainer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import echarts from '@/plugins/echarts';
import { ChartType, IChartSetting } from './type';

defineOptions({
    name: "EChartsViewer",
});

const props = withDefaults(defineProps<{
    setting: IChartSetting;
}>(),
    {
    }
);

const chartOpts = ref<echarts.EChartsCoreOption>();

const getChartOpts = (setting: IChartSetting) => {
    let chartType = setting.chartType || "";
    let chartSubType = setting.chartSubType || chartType;
    let opt: any;
    switch (chartType) {
        case ChartType.VBar: // 垂直柱状图
            opt = {
                xAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
                yAxis: { type: 'value' },
                series: [{ type: 'bar', data: [5, 20, 36, 10, 15] }]
            }
            if (chartSubType == "stack") {
                // opt.series[0]["stack"] = "total";
                opt = {
                    xAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
                    yAxis: { type: 'value' },
                    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } }, // 轴提示优化
                    legend: { data: ['系列1', '系列2', '系列3'] }, // 堆叠系列图例
                    series: [
                        { name: '系列1', type: 'bar', stack: 'total', data: [5, 20, 36, 10, 15] },
                        { name: '系列2', type: 'bar', stack: 'total', data: [3, 15, 22, 8, 10] },
                        { name: '系列3', type: 'bar', stack: 'total', data: [2, 8, 15, 5, 6] }
                    ]
                }
            }
            if (chartSubType == "waterfall") {
                opt = {
                    xAxis: { type: 'category', data: ['初始化', '新增', '减少', '调整', '最终值'] },
                    yAxis: { type: 'value' },
                    tooltip: { trigger: 'axis' },
                    legend: { data: ['数值'] },
                    series: [
                        {
                            name: '数值',
                            type: 'bar',
                            data: [
                                { value: 100, itemStyle: { color: '#66b1ff' } }, // 初始值
                                { value: 50, itemStyle: { color: '#73d13d' } },  // 新增（正）
                                { value: -30, itemStyle: { color: '#ff4d4f' } }, // 减少（负）
                                { value: 20, itemStyle: { color: '#73d13d' } },  // 调整（正）
                                {
                                    value: 140,
                                    itemStyle: { color: '#ff7a45' },
                                    label: { show: true, position: 'top' } // 汇总项显示数值
                                }
                            ]
                        }
                    ]
                }
            }
            chartOpts.value = opt
            break;
        case ChartType.HBar: // 水平柱状图（x/y轴类型互换）
            opt = {
                xAxis: { type: 'value' },
                yAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
                series: [{ type: 'bar', data: [5, 20, 36, 10, 15] }]
            }
            if (chartSubType == "stack") {
                // opt.series[0]["stack"] = "total";
                opt = {
                    xAxis: { type: 'value' },
                    yAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
                    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                    legend: { data: ['系列1', '系列2', '系列3'] },
                    series: [
                        { name: '系列1', type: 'bar', stack: 'total', data: [5, 20, 36, 10, 15] },
                        { name: '系列2', type: 'bar', stack: 'total', data: [3, 15, 22, 8, 10] },
                        { name: '系列3', type: 'bar', stack: 'total', data: [2, 8, 15, 5, 6] }
                    ]
                }
            }
            chartOpts.value = opt
            break;
        case ChartType.Line: // 折线图
            opt = {
                xAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
                yAxis: { type: 'value' },
                series: [{ type: 'line', data: [5, 20, 36, 10, 15], smooth: true }]
            }
            if (chartSubType == "stack") {
                opt.series[0]["stack"] = "total"
            }
            if (chartSubType == "area") {
                opt.series[0]["areaStyle"] = { color: "rgba(25,183,207,0.2)" }
            }
            if (chartSubType == "smooth") {
                opt.series[0]["smooth"] = true
            }
            if (chartSubType == "step") {
                opt.series[0]["step"] = "start"
            }

            chartOpts.value = opt
            break;
        case ChartType.Pie: // 饼图（无需x/y轴，避免多余配置导致报错）
            opt = {
                tooltip: { trigger: 'item' },
                series: [{
                    type: 'pie',
                    radius: '50%',
                    data: [
                        { name: 'A', value: 5 },
                        { name: 'B', value: 20 },
                        { name: 'C', value: 36 }
                    ]
                }]
            }
            if (chartSubType == "circle") {
                opt.series[0].radius = ['40%', '70%'];
                opt.series[0]["center"] = ['50%', '50%']
            }
            if (chartSubType == "area") {
                opt.series[0].radius = ['10%', '80%'];
                opt.series[0]["center"] = ['50%', '50%']
                opt.series[0]["roseType"] = "area"
            }
            chartOpts.value = opt
            break;
        default:
            chartOpts.value = undefined;
            break;
    }
    console.log("getchartopts", setting, chartOpts.value)
}
watch(() => props.setting, (newVal) => {
    if (newVal) {
        getChartOpts(newVal)
    }
}, {
    immediate: true,
    deep: true
});

</script>

<style scoped>
.w-full {
    width: 100%;
}

.h-full {
    height: 100%;
}
</style>