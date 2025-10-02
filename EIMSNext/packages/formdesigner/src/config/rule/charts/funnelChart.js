import {localeOptions, localeProps, makeDataRule} from '../../../utils';

const label = '漏斗图';
const name = 'funnelChart';

export default {
    menu: 'chart',
    icon: 'icon-chart-funnel',
    label: label,
    name: name,
    mask: false,
    event: ['beforeLoad', 'loaded'],
    rule() {
        return {
            type: 'fcEcharts',
            props: {
                type: 'funnel',
                data: [
                    {value: 60, name: 'Visit'},
                    {value: 40, name: 'Inquiry'},
                    {value: 20, name: 'Order'},
                    {value: 80, name: 'Click'},
                    {value: 100, name: 'Show'}
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
                field: 'funnelSort',
                options: localeOptions(t, [
                    {label: 'descending', value: 'descending'},
                    {label: 'ascending', value: 'ascending'},
                ], 'com.lineChart.funnelSortOpt'),
                value: 'descending'
            },
            {
                type: 'switch',
                field: 'showLegend',
                value: true,
            },
        ]);
    },
};



