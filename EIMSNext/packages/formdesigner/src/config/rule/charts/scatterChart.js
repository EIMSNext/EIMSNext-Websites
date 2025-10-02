import {localeProps, makeDataRule} from '../../../utils';

const label = '散点图';
const name = 'scatterChart';

export default {
    menu: 'chart',
    icon: 'icon-chart-scatter',
    label: label,
    name: name,
    mask: false,
    event: ['beforeLoad', 'loaded'],
    rule() {
        return {
            type: 'fcEcharts',
            props: {
                type: 'scatter',
                data: [
                    [
                        [161.2, 51.6], [167.5, 59.0], [159.5, 49.2], [157.0, 63.0], [155.8, 53.6],
                        [170.0, 59.0], [159.1, 47.6], [166.0, 69.8], [176.2, 66.8], [160.2, 75.2],
                    ],
                    [
                        [172.5, 55.2], [170.9, 54.2], [172.9, 62.5], [153.4, 42.0], [160.0, 50.0],
                        [147.2, 49.8], [168.2, 49.2], [175.0, 73.2], [157.0, 47.8], [167.6, 68.8],
                    ]
                ],
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
        ]);
    },
};

