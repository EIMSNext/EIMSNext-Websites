import {uniqueId} from '@eimsnext/form-render-core';
import {localeProps} from '../../utils';

const label = '分步表单';
const name = 'stepForm';

export default {
    menu: 'subform',
    icon: 'icon-step-form',
    label,
    name,
    input: true,
    mask: false,
    languageKey: ['prevStep', 'nextStep', 'submit'],
    event: ['change', 'submit', 'next'],
    subForm: 'object',
    children: 'stepFormItem',
    childrenLen: 2,
    subRender({t, h, resolveComponent, subRule}) {
        return [
            {
                label: t('props.title'),
                vnode: h(resolveComponent('el-input'), {
                    size: 'small',
                    modelValue: subRule.props.title,
                    'onUpdate:modelValue': (v) => {
                        subRule.props.title = v;
                    }
                })
            }
        ]
    },
    loadRule(rule) {
        if (!rule.props) rule.props = {};
        const steps = rule.props.steps || {};
        rule.children = steps.map(step => {
            return {
                type: 'stepFormItem',
                _fc_drag_tag: 'stepFormItem',
                props: {
                    title: step.props.title,
                    description: step.props.description,
                },
                children: step.rule
            }
        });
        delete rule.props.steps;
    },
    parseRule(rule) {
        const children = rule.children || [];
        rule.props.steps = children.map(step => {
            return {
                props: step.props,
                rule: step.children
            };
        })
        rule.children = [];
    },
    sfc: false,
    rule() {
        return {
            type: name,
            field: uniqueId(),
            title: '',
            info: '',
            $required: false,
            props: {},
            children: [],
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {type: 'switch', field: 'autoValidate'},
            {type: 'switch', field: 'stepsProps>alignCenter'}, {
                type: 'switch',
                field: 'stepsProps>simple'
            }]);
    }
};
