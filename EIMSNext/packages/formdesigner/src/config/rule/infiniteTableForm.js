import {uniqueId} from '@eimsnext/form-render-core';
import {localeProps} from '../../utils';

const label = '无限级表单';
const name = 'infiniteTableForm';

export default {
    menu: 'subform',
    icon: 'icon-table-form3',
    label,
    name,
    input: true,
    mask: false,
    subForm: 'array',
    languageKey: ['add', 'operation'],
    event: ['change', 'add', 'delete'],
    children: 'tableFormColumn',
    subRender({t, h, resolveComponent, subRule}) {
        return [
            {
                label: t('props.title'),
                vnode: h(resolveComponent('el-input'), {
                    size: 'small',
                    modelValue: subRule.props.label,
                    'onUpdate:modelValue': (v) => {
                        subRule.props.label = v;
                    }
                })
            }
        ]
    },
    loadRule(rule) {
        if (!rule.props) rule.props = {};
        const columns = rule.props.columns || [];
        rule.children = columns.map(column => {
            return {
                type: 'tableFormColumn',
                _fc_drag_tag: 'tableFormColumn',
                props: {
                    label: column.label,
                    required: column.required || false,
                    width: column.style.width || '',
                    color: column.style.color || '',
                },
                children: column.rule || []
            }
        });
        delete rule.props.columns;
    },
    parseRule(rule) {
        const children = rule.children || [];
        rule.props.columns = children.map(column => {
            return {
                label: column.props.label,
                required: column.props.required,
                style: {
                    width: column.props.width,
                    color: column.props.color,
                },
                rule: column.children || []
            };
        })
        rule.children = [];
    },
    sfc: false,
    rule({t}) {
        return {
            type: name,
            field: uniqueId(),
            title: t('com.' + name + '.name'),
            info: '',
            props: {},
            children: []
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {
                type: 'switch',
                field: 'disabled'
            },
            {
                type: 'input',
                field: 'childrenField',
                value: 'children'
            },
            {
                type: 'inputNumber',
                field: 'max',
                props: {min: 0}
            },
            {
                type: 'inputNumber',
                field: 'layerMax',
                props: {min: 0}
            }
        ]);
    }
};
