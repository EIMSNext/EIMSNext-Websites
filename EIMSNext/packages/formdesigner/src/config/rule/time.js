import {uniqueId} from '@eimsnext/form-render-core';
import {localeOptions, localeProps} from '../../utils';

const label = '时间';
const name = 'timePicker';

export default {
    menu: 'main',
    icon: 'icon-time',
    label,
    name,
    input: true,
    event: ['change', 'blur', 'focus', 'visibleChange'],
    sfc(rule) {
        if (!rule.props.valueFormat) {
            rule.props.valueFormat = 'HH:mm:ss'
        }
    },
    rule({t}) {
        return {
            type: name,
            field: uniqueId(),
            title: t('com.timePicker.name'),
            info: '',
            $required: false,
            props: {},
        };
    },
    watch: {
        isRange({rule}) {
            rule.key = uniqueId();
        },
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
        return localeProps(t, name + '.props', [{type: 'switch', field: 'readonly'}, {
            type: 'switch',
            field: 'disabled'
        }, {
            type: 'switch',
            field: 'isRange'
        }, 
        // {
        //     type: 'switch',
        //     field: 'clearable',
        //     value: true
        // }, 
        {
            type: 'select',
            field: '__format',
            options: [
                {
                    label: t('com.' + name + '.HH:mm:ss'),
                    value: 'HH:mm:ss'
                },
                {
                    label: t('com.' + name + '.HH:mm'),
                    value: 'HH:mm'
                }
            ]
        }, 
        // {
        //     type: 'Struct',
        //     field: 'pickerOptions',
        //     props: {defaultValue: {}}
        // }, 
        {type: 'switch', field: 'editable', value: true}, {
            type: 'input',
            field: 'placeholder'
        }, {
            type: 'input',
            field: 'startPlaceholder'
        }
         , {type: 'input', field: 'endPlaceholder'}
        // ,{
        //     type: 'switch',
        //     field: 'arrowControl'
        // }, {
        //     type: 'select',
        //     field: 'align',
        //     options: localeOptions(t, [{label: 'left', value: 'left'}, {label: 'center', value: 'center'}, {
        //         label: 'right',
        //         value: 'right'
        //     }])
        // }
    ]);
    }
};
