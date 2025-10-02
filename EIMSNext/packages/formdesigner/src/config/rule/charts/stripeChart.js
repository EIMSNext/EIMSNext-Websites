import {localeProps, makeDataRule} from '../../../utils';

const label = '条形图';
const name = 'stripeChart';

export default {
    menu: 'chart',
    icon: 'icon-chart-stripe',
    label: label,
    name: name,
    mask: false,
    event: ['beforeLoad', 'loaded'],
    rule() {
        return {
            type: 'fcEcharts',
            props: {
                type: 'bar',
                stripe: true,
                config: {
                    category: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    series: [
                        {
                            name: 'Direct',
                            data: [320, 332, 301, 334, 390, 330, 320]
                        },
                        {
                            name: 'Direct2',
                            data: [320, 332, 301, 334, 390, 330, 320]
                        },
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
                type: 'ColorInput',
                field: 'barBackgroundColor',
            },
            {
                type: 'switch',
                field: 'stack',
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

