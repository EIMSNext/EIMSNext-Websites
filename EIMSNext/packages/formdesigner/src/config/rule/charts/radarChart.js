import {localeProps, makeDataRule} from '../../../utils';

const label = '雷达图';
const name = 'radarChart';

export default {
    menu: 'chart',
    icon: 'icon-chart-radar',
    label: label,
    name: name,
    mask: false,
    event: ['beforeLoad', 'loaded'],
    rule() {
        return {
            type: 'fcEcharts',
            props: {
                type: 'radar',
                indicator: [
                    {name: 'Sales', max: 6500},
                    {name: 'Administration', max: 16000},
                    {name: 'Information Technology', max: 30000},
                    {name: 'Customer Support', max: 38000},
                    {name: 'Development', max: 52000},
                    {name: 'Marketing', max: 25000}
                ],
                data: [
                    {
                        value: [4200, 3000, 20000, 35000, 50000, 18000],
                        name: 'Allocated Budget'
                    },
                    {
                        value: [5000, 14000, 28000, 26000, 42000, 21000],
                        name: 'Actual Spending'
                    }
                ]
            },
        };
    },
    props(_, {t}) {
        return localeProps(t, 'lineChart.props', [
            makeDataRule(t, 'props.data', t('com.lineChart.data')),
            {
                type: 'TableOptions',
                field: 'indicator',
                props: {
                    column: [{label: t('props.name'), key: 'name'}, {label: t('com.lineChart.props.max'), key: 'max'}],
                }
            },
            {
                type: 'input',
                field: 'title',
            },
            {
                type: 'input',
                field: 'subtitle',
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



