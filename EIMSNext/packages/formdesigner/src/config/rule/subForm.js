import {localeProps} from '../../utils';
import {uniqueId} from '@eimsnext/form-render-core';

const label = '分组';
const name = 'subForm';

export default {
    menu: 'subform',
    icon: 'icon-group',
    label,
    name,
    input: true,
    inside: false,
    drag: true,
    dragBtn: true,
    mask: false,
    subForm: 'object',
    event: ['change'],
    loadRule(rule) {
        rule.children = rule.props.rule || [];
        rule.type = 'FcRow';
        delete rule.props.rule;
    },
    parseRule(rule) {
        rule.props.rule = rule.children;
        rule.type = 'subForm';
        delete rule.children;
    },
    sfc(rule, {getParentFieldStr}) {
        return {
            type: 'elFormItem',
            props: {
                prop: getParentFieldStr() + rule.field,
                label: rule.title,
                required: rule.$required === true ? true : undefined
            },
            col: {show: true},
            _sfc: {
                parentField: rule.field
            },
            _fc_id: rule._fc_id,
            children: [
                {
                    type: 'elRow',
                    class: rule.class,
                    style: rule.style,
                    children: rule.children
                }
            ]
        }
    },
    rule({t}) {
        return {
            type: 'fcRow',
            field: uniqueId(),
            title: t('com.subForm.name'),
            info: '',
            $required: false,
            props: {},
            children: []
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [{
            type: 'switch',
            field: 'disabled'
        },
        ]);
    }
};
