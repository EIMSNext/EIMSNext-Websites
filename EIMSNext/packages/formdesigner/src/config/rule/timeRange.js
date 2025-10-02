import {uniqueId} from '@eimsnext/form-render-core';
import {localeOptions, localeProps} from '../../utils';
import time from './time';

const label = '时间区间';
const name = 'timeRange';

export default {
    menu: 'main',
    icon: 'icon-time-range',
    label,
    name,
    input: true,
    event: ['change', 'blur', 'focus', 'visibleChange'],
    sfc: time.sfc,
    rule({t}) {
        return {
            type: 'timePicker',
            field: uniqueId(),
            title: t('com.timeRange.name'),
            info: '',
            $required: false,
            props: {
                isRange: true,
            },
        };
    },
    watch: {
        __format({value, rule}) {
            rule.props.format = value;
            rule.props.valueFormat = value;
        },
    },
    attrs: {
        format({rule}) {
            return rule.props.format || '';
        },
    },
    props(_, {t}) {
        return localeProps(t, 'timePicker.props', [{type: 'switch', field: 'readonly'}, {
            type: 'switch',
            field: 'disabled'
        }, {
            type: 'switch',
            field: 'clearable',
            value: true
        }, {
            type: 'select',
            field: '__format',
            options: [
                {
                    label: t('com.timePicker.HH:mm:ss'),
                    value: 'HH:mm:ss'
                },
                {
                    label: t('com.timePicker.HH:mm'),
                    value: 'HH:mm'
                }
            ]
        }, {
            type: 'Struct',
            field: 'pickerOptions',
            props: {defaultValue: {}}
        }, {type: 'switch', field: 'editable', value: true}, {
            type: 'input',
            field: 'startPlaceholder'
        }, {type: 'input', field: 'endPlaceholder'}, {
            type: 'switch',
            field: 'arrowControl'
        }, {
            type: 'select',
            field: 'align',
            options: localeOptions(t, [{label: 'left', value: 'left'}, {label: 'center', value: 'center'}, {
                label: 'right',
                value: 'right'
            }])
        }]);
    }
};
