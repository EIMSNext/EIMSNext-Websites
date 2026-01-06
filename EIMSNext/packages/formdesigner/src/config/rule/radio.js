import {uniqueId} from '@eimsnext/form-render-core';
import {localeProps, makeOptionsRule, makeTreeOptions} from '../../utils/index';

const label = '单选框';
const name = 'radio';

export default {
    menu: 'main',
    icon: 'icon-radio',
    label,
    name,
    input: true,
    event: ['change'],
    validate: ['string', 'number'],
    condition: {
        type: 'select',
        options: 'options'
    },
    sfc(rule) {
        rule.type = 'elRadioGroup';
        rule.children = (rule.options || []).map(opt => {
            return {
                type: rule.props.type === 'button' ? 'elRadioButton' : 'elRadio',
                props: {
                    label: opt,
                    value: opt,
                },
                _sfc:{
                    content: opt.label
                }
            }
        })
        delete rule.props.type;
    },
    rule({t}) {
        return {
            type: name,
            field: uniqueId(),
            title: t('com.radio.name'),
            info: '',
            effect: {
                fetch: ''
            },
            $required: false,
            props: {},
            options: makeTreeOptions(t('props.option'), {label: 'label', value: 'value'}, 1)
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            makeOptionsRule(t, 'options'),
            // {type: 'switch', field: 'disabled'}
            // {
            //     type: "CheckBoxInput",
            //     field: "disabled",
            //     wrap: { show: false },
            //   },
            // ,
            // {type: 'switch', field: 'input'}
            // , 
            // {
            //     type: 'switch',
            //     field: 'type',
            //     props: {activeValue: 'button', inactiveValue: 'default'}
            // }, {type: 'ColorInput', field: 'textColor'}, {
            //     type: 'ColorInput',
            //     field: 'fill'
            // }

              {
                type: "CheckBoxInput",
                field: "readonly",
                wrap: { show: false },
              },
              {
                type: "CheckBoxInput",
                field: "disabled",
                wrap: { show: false },
              },
        ]);
    }
};
