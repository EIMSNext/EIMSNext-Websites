import {uniqueId} from '@eimsnext/form-render-core';
import {localeProps} from '../../utils';

const label = '开关';
const name = 'switch';

export default {
    menu: 'main',
    icon: 'icon-switch',
    label,
    name,
    input: true,
    // easySlots: ['active-action', 'inactive-action'],
    event: ['change'],
    condition: function (rule) {
        return {
            type: 'switch',
            props: {
                activeValue: rule.props.activeValue,
                inactiveValue: rule.props.inactiveValue,
                activeText: rule.props.activeText,
                inactiveText: rule.props.inactiveText,
            }
        }
    },
    rule({t}) {
        return {
            type: name,
            field: uniqueId(),
            title: t('com.switch.name'),
            info: '',
            $required: false,
            props: {
                activeValue: true,
                inactiveValue: false,
            },
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [{
            type: 'switch',
            field: 'disabled'
        }, 
        // {
        //     type: 'inputNumber',
        //     field: 'width',
        //     props: {min: 0},
        // }, 
        {type: 'input', field: 'activeText'}, {
            type: 'input',
            field: 'inactiveText'
        }
        // , 
        // {type: 'ValueInput', field: 'activeValue'}, {
        //     type: 'ValueInput',
        //     field: 'inactiveValue'
        // }, 
        // {type: 'ColorInput', field: 'activeColor'}, {
        //     type: 'ColorInput',
        //     field: 'inactiveColor'
        // }
    ]);
    }
};
