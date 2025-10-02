import {uniqueId} from '@eimsnext/form-render-core';
import {localeProps} from '../../utils';

const label = '嵌套表单';
const name = 'nestedTableForm';

const tidyColumns = columns => columns.map(column => {
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
})

export default {
    menu: 'subform',
    icon: 'icon-table-form2',
    label,
    name,
    input: true,
    mask: false,
    subForm: 'array',
    languageKey: ['add', 'operation'],
    event: ['change', 'add', 'delete'],
    slot: ['default', {
        name: 'nested',
        type: 'nestedSubTableForm',
    }],
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
        const nested = rule.props.nested || [];
        rule.children = tidyColumns(columns);
        rule.children.push({
            type: 'TableForm',
            _fc_drag_tag: 'nestedSubTableForm',
            field: rule.props.nestedField,
            props: {
                columns: nested,
            },
            slot: 'nested',
        })
        delete rule.props.nestedField;
        delete rule.props.columns;
        delete rule.props.nested;
    },
    parseRule(rule) {
        const children = rule.children || [];
        rule.props.columns = [];
        children.forEach(column => {
            if (column.slot === 'nested') {
                rule.props.nested = column.props.columns;
                rule.props.nestedField = column.field;
                return;
            }
            rule.props.columns.push({
                label: column.props.label,
                required: column.props.required,
                style: {
                    width: column.props.width,
                    color: column.props.color,
                },
                rule: column.children || []
            });
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
                type: 'inputNumber',
                field: 'max',
                props: {min: 0}
            }, {
                type: 'inputNumber',
                field: 'nestedMax',
                props: {min: 0}
            }
        ]);
    }
};
