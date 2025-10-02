import {localeProps} from '../../../utils';

const label = '仪表盘';
const name = 'gaugeChart';

export default {
    menu: 'chart',
    icon: 'icon-chart-gauge',
    label: label,
    name: name,
    mask: false,
    event: ['beforeLoad', 'loaded'],
    rule() {
        return {
            type: 'fcEcharts',
            props: {
                type: 'gauge',
                value: 50
            },
        };
    },
    props(_, {t}) {
        return localeProps(t, 'lineChart.props', [
            {
                type: 'inputNumber',
                field: 'value',
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
                type: 'inputNumber',
                field: 'min',
            },
            {
                type: 'inputNumber',
                field: 'max',
            },
        ]);
    },
};



