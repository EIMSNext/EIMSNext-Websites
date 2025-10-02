import {uniqueId} from '@eimsnext/form-render-core';

const label = '子表格表单';
const name = 'nestedSubTableForm';

export default {
    icon: 'icon-table-form',
    label,
    name,
    aide: true,
    mask: false,
    validate: false,
    style: false,
    advanced: false,
    variable: false,
    subForm: 'array',
    hiddenBaseField: ['title', 'info', 'labelConfig', 'formCreate_computed>hidden', 'formCreate_computed>value', '_control'],
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
    rule() {
        return {
            type: 'TableForm',
            field: uniqueId(),
            title: '',
            info: '',
            props: {},
            children: []
        };
    },
    props() {
        return [];
    }
};
