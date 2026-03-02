<template>
    <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useEcharts } from './types';
import echarts from '@/plugins/echarts';
import { useSettingsStore } from '@/store';

defineOptions({
    name: "EChartsContainer",
});

const props = withDefaults(defineProps<{
    options: echarts.EChartsCoreOption;
    autoResize?: boolean
}>(),
    {
        autoResize: true,
    }
);

const chartRef = ref<HTMLDivElement | null>(null);
const settingsStore = useSettingsStore();
const { chart, initChart } = useEcharts(chartRef, props.options, {
    theme: settingsStore.theme,
    autoResize: props.autoResize
});

watch(() => props.options, (newVal) => {
    initChart(newVal)
},
    { deep: true, immediate: true }
);
</script>