import {localeProps, makeDataRule} from '../../../utils';

const label = '体积图';
const name = 'areaChart';

export default {
    menu: 'chart',
    icon: 'icon-chart-area',
    label: label,
    name: name,
    mask: false,
    event: ['beforeLoad', 'loaded'],
    rule() {
        return {
            type: 'fcEcharts',
            props: {
                type: 'area',
                config: {
                    category: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    series: [
                        {
                            name: 'Email',
                            data: [120, 132, 101, 134, 90, 230, 210]
                        },
                        {
                            name: 'Union Ads',
                            data: [220, 182, 191, 234, 290, 330, 310]
                        },
                        {
                            name: 'Video Ads',
                            data: [150, 232, 201, 154, 190, 330, 410]
                        },
                        {
                            name: 'Direct',
                            data: [320, 332, 301, 334, 390, 330, 320]
                        },
                        {
                            name: 'Search Engine',
                            data: [820, 932, 901, 934, 1290, 1330, 1320]
                        }
                    ]
                }
            },
        };
    },
    props(_, {t}) {
        return localeProps(t, 'lineChart.props', [
            makeDataRule(t, 'props.config', t('com.lineChart.data')),
            {
                type: 'input',
                field: 'title',
            },
            {
                type: 'input',
                field: 'subtitle',
            },
            {
                type: 'input',
                field: 'valueFormat',
                value: '{value}'
            },
            {
                type: 'switch',
                field: 'stack',
            },
            {
                type: 'switch',
                field: 'smooth',
            },
            {
                type: 'switch',
                field: 'showLegend',
                value: true,
            },
            {
                type: 'switch',
                field: 'showSeriesLabel',
            },
        ]);
    },
};

