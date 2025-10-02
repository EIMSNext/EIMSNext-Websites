<template>
    <div class="_fc-echarts" ref="chart">
    </div>
</template>

<script>
import loadjs from 'loadjs';
import {defineComponent, markRaw} from 'vue';
import { debounce } from '@eimsnext/form-render-core';

export default defineComponent({
    name: 'FcEcharts',
    data() {
        return {
            chart: null,
        };
    },
    emits: ['beforeLoad', 'loaded'],
    props: {
        title: String,
        value: Number,
        min: Number,
        max: Number,
        name: String,
        valueFormat: String,
        subtitle: String,
        funnelSort: String,
        config: Object,
        data: Array,
        indicator: Array,
        smooth: Boolean,
        stripe: Boolean,
        showLegend: {
            type: Boolean,
            default: true
        },
        loadOptions: {
            type: Function,
            default: () => {
            }
        },
        showSeriesLabel: Boolean,
        type: String,
        pieType: String,
        stack: Boolean,
        barBackgroundColor: String,
    },
    watch: {
        '$props': {
            handler: debounce(function () {
                this.load();
            }, 600),
            deep: true,
        }
    },
    methods: {
        getSeries() {
            const append = {
                type: 'line',
                stack: this.stack ? 'Total' : '',
                smooth: this.smooth,
                showBackground: false,
                label: {
                    show: this.showSeriesLabel,
                    position: this.stripe ? 'inside' : 'top'
                }
            };
            if (this.type === 'area') {
                append.areaStyle = {};
                append.emphasis = {
                    focus: 'series'
                };
            } else if (this.type === 'bar') {
                append.type = 'bar';
                if (this.barBackgroundColor) {
                    append.showBackground = true;
                    append.backgroundStyle = {
                        color: this.barBackgroundColor
                    };
                }
            }
            let series = this.config?.series || [];
            if (!series.length) {
                return []
            }
            if (typeof series[0] != 'object') {
                series = [{
                    data: series,
                }]
            }
            series = series.map(item => {
                return {
                    ...append, ...item
                };
            })
            return series;
        },
        getTooltip() {
            const tooltip = {
                trigger: 'axis',
                valueFormat: undefined,
            }
            if (this.valueFormat) {
                tooltip.valueFormatter = (value) => {
                    if (!this.valueFormat) {
                        return value;
                    }
                    return this.valueFormat.replaceAll('{value}', value);
                }
            }
            if (this.type === 'bar') {
                tooltip.axisPointer = {
                    type: 'shadow'
                }
            }
            return tooltip;
        },
        getAxis() {
            if (!this.stripe) {
                return {
                    xAxis: {
                        type: 'category',
                        boundaryGap: this.type === 'bar',
                        data: this.config?.category
                    },
                    yAxis: {
                        type: 'value'
                    },
                }
            } else {
                return {
                    yAxis: {
                        type: 'category',
                        boundaryGap: this.type === 'bar',
                        data: this.config?.category || []
                    },
                    xAxis: {
                        type: 'value'
                    },
                }
            }
        },
        getDefOptions() {
            return {
                title: {
                    text: this.title,
                    subtext: this.subtitle,
                },
                tooltip: this.getTooltip(),
                legend: {
                    left: 'right',
                    show: this.showLegend,
                },
                grid: {
                    left: '20px',
                    right: '20px',
                    bottom: '20px',
                    containLabel: true
                },
                ...this.getAxis(),
                series: this.getSeries()
            };
        },
        getPieOptions() {
            const append = {
                radius: '50%',
                center: '50%',
                startAngle: 0,
                avoidLabelOverlap: true,
                labelLine: {
                    show: true,
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            };
            if (this.pieType === 'doughnut') {
                append.radius = ['40%', '70%'];
                append.avoidLabelOverlap = false;
            } else if (this.pieType === 'half-doughnut') {
                append.radius = ['40%', '70%'];
                append.center = ['50%', '70%'];
                append.startAngle = 180;
                append.endAngle = 360;
            }
            return {
                title: {
                    text: this.title,
                    subtext: this.subtitle,
                    left: 'left'
                },
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    left: 'right',
                    show: this.showLegend,
                },
                series: [
                    {
                        type: 'pie',
                        data: this.data,
                        ...append,
                    }
                ]
            }
        },
        getGaugeOptions() {
            return {
                title: {
                    text: this.title,
                    subtext: this.subtitle,
                    left: 'center'
                },
                series: [
                    {
                        name: 'Pressure',
                        type: 'gauge',
                        min: this.min || 0,
                        max: this.max || 60,
                        progress: {
                            show: true
                        },
                        detail: {
                            valueAnimation: true,
                            formatter: '{value}'
                        },
                        data: [
                            {
                                value: this.value,
                                name: this.name
                            }
                        ]
                    }
                ]
            }
        },
        getRadarOptions() {
            return {
                title: {
                    text: this.title,
                    subtext: this.subtitle,
                    left: 'left'
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    left: 'right',
                    show: this.showLegend,
                },
                radar: {
                    indicator: this.indicator
                },
                series: [
                    {
                        type: 'radar',
                        tooltip: {
                            trigger: 'item'
                        },
                        data: this.data
                    }
                ]
            }
        },
        getScatterOptions() {
            return {
                title: {
                    text: this.title,
                    subtext: this.subtitle,
                    left: 'left'
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    left: 'right',
                    show: true,
                },
                xAxis: {
                    scale: true
                },
                yAxis: {
                    scale: true
                },
                grid: {
                    left: '20px',
                    right: '20px',
                    bottom: '20px',
                    containLabel: true
                },
                series: (this.data || []).map((data) => {
                    if (Array.isArray(data)) {
                        return {
                            type: 'scatter',
                            data: data
                        }
                    } else {
                        return {type: 'scatter', ...data}
                    }
                })
            }
        },
        getFunnelOptions() {
            return {
                title: {
                    text: this.title,
                    subtext: this.subtitle,
                    left: 'left'
                },
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    left: 'right',
                    show: this.showLegend,
                },
                series: [
                    {
                        name: 'Funnel',
                        type: 'funnel',
                        left: '10%',
                        top: '40px',
                        bottom: '20px',
                        width: '80%',
                        min: 0,
                        max: Math.max(...(this.data || []).map(v => v.value)),
                        minSize: '0%',
                        maxSize: '100%',
                        sort: this.funnelSort || 'descending',
                        gap: 2,
                        label: {
                            show: true,
                            position: 'inside'
                        },
                        labelLine: {
                            length: 10,
                            lineStyle: {
                                width: 1,
                                type: 'solid'
                            }
                        },
                        itemStyle: {
                            borderColor: '#fff',
                            borderWidth: 1
                        },
                        emphasis: {
                            label: {}
                        },
                        data: this.data,
                    }
                ]
            }
        },
        load() {
            this.$nextTick(() => {
                loadjs.ready('echarts', () => {
                    this.chart = markRaw(window.echarts.init(this.$refs.chart));
                    let options;
                    if (this.type === 'pie') {
                        options = this.getPieOptions();
                    } else if (this.type === 'funnel') {
                        options = this.getFunnelOptions();
                    } else if (this.type === 'gauge') {
                        options = this.getGaugeOptions();
                    } else if (this.type === 'radar') {
                        options = this.getRadarOptions();
                    } else if (this.type === 'scatter') {
                        options = this.getScatterOptions();
                    } else if (this.type === 'custom') {
                        options = this.loadOptions(this.config, this.chart) || {};
                        if (typeof options.then === 'function') {
                            options.then(res => {
                                this.$emit('beforeLoad', this.chart, res);
                                this.chart.setOption(res);
                                this.$emit('loaded', this.chart, res);
                            })
                            return;
                        }
                    } else {
                        options = this.getDefOptions();
                    }
                    this.$emit('beforeLoad', this.chart, options);
                    this.chart.setOption(options);
                    this.$emit('loaded', this.chart, options);
                });
            });
        },
    },
    created() {
        if (window.echarts) {
            loadjs.done('echarts');
        } else if (!loadjs.isDefined('echarts')) {
            loadjs(['https://static.form-create.com/res/echarts.min.js'], 'echarts');
        }
    },
    mounted() {
        this.load();
    }
});
</script>

<style>
._fc-echarts {
    width: 100%;
    height: 300px;
}
</style>