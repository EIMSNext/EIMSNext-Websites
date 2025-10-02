import {uniqueId} from '@eimsnext/form-render-core';
import {localeProps} from '../../utils';

const label = '颜色选择器';
const name = 'colorPicker';

export default {
    menu: 'main',
    icon: 'icon-color',
    label,
    name,
    input: true,
    event: ['change', 'activeChange', 'focus', 'blur'],
    validate: ['string'],
    condition: 'color',
    rule({t}) {
        return {
            type: name,
            field: uniqueId(),
            title: t('com.colorPicker.name'),
            info: '',
            $required: false,
            props: {
                predefine: [
                    '#c9e6fc',
                    '#c3f2f2',
                    '#c2f1d2',
                    '#fef6c6',
                    '#ffe5c2',
                    '#fdcac2',
                    '#fadcce',
                    '#dec2fa',
                    '#ccd2f1',
                    '#2196f3',
                    '#08c9c9',
                    '#00c344',
                    '#fad714',
                    '#ff9300',
                    '#f52222',
                    '#eb2f96',
                    '#800080',
                    '#7500ea',
                    '#2d46c4',
                    '#000000',
                    '#333333',
                    '#5a5a5a',
                    '#757575',
                    '#9e9e9e',
                    '#bdbdbd',
                    '#dddddd',
                    '#f5f5f5',
                    '#ffffff',
                ]
            },
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {
                type: 'switch',
                field: 'disabled'
            },
            {
                type: 'switch',
                field: 'showAlpha'
            },
            {
                type: 'select',
                field: 'colorFormat',
                options: [{label: 'hsl', value: 'hsl'}, {label: 'hsv', value: 'hsv'}, {
                    label: 'hex',
                    value: 'hex'
                }, {label: 'rgb', value: 'rgb'}]
            },
            {
                type: 'tableOptions',
                field: 'predefine',
                props: {
                    column: [{label: t('props.value'), key: 'value'}],
                    valueType: 'string'
                }
            },
        ]);
    }
};
