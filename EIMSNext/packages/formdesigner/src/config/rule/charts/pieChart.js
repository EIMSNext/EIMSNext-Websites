import {localeOptions, localeProps, makeDataRule} from '../../../utils';

const label = '饼图';
const name = 'pieChart';

export default {
    menu: 'chart',
    icon: 'icon-chart-pie',
    label: label,
    name: name,
    mask: false,
    event: ['beforeLoad', 'loaded'],
    rule() {
        return {
            type: 'fcEcharts',
            props: {
                type: 'pie',
                data: [
                    {value: 1048, name: 'Search Engine'},
                    {value: 735, name: 'Direct'},
                    {value: 580, name: 'Email'},
                    {value: 484, name: 'Union Num'},
                    {value: 300, name: 'Video Num'}
                ]
            },
        };
    },
    props(_, {t}) {
        return localeProps(t, 'lineChart.props', [
            makeDataRule(t, 'props.data', t('com.lineChart.data')),
            {
                type: 'input',
                field: 'title',
            },
            {
                type: 'input',
                field: 'subtitle',
            },
            {
                type: 'select',
                field: 'pieType',
                options: localeOptions(t, [
                    {label: 'pie', value: 'pie'},
                    {label: 'doughnut', value: 'doughnut'},
                    {label: 'half-doughnut', value: 'half-doughnut'},
                ], 'com.lineChart.pieTypeOpt'),
            },
            {
                type: 'switch',
                field: 'showLegend',
                value: true,
            },
        ]);
    },
};



