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
    switch (chartType) {
        case ChartType.VBar: // 垂直柱状图
            chartOpts.value = {
                xAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
                yAxis: { type: 'value' },
                series: [{ type: 'bar', data: [5, 20, 36, 10, 15] }]
            }
            break;
        case ChartType.HBar: // 水平柱状图（x/y轴类型互换）
            chartOpts.value = {
                xAxis: { type: 'value' },
                yAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
                series: [{ type: 'bar', data: [5, 20, 36, 10, 15] }]
            }
            break;
        case ChartType.Line: // 折线图
            chartOpts.value = {
                xAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
                yAxis: { type: 'value' },
                series: [{ type: 'line', data: [5, 20, 36, 10, 15], smooth: true }]
            }
            break;
        case ChartType.Pie: // 饼图（无需x/y轴，避免多余配置导致报错）
            chartOpts.value = {
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