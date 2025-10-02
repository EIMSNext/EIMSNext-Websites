import {localeOptions, localeProps} from '../../utils';

const label = '描述格子';
const name = 'elDescriptionsItem';

export default {
    icon: 'icon-cell',
    label,
    name,
    dragBtn: false,
    inside: true,
    mask: false,
    rule({t}) {
        return {
            type: name,
            props: {
                label: t('props.title'),
            },
            children: [t('props.content')],
        };
    },
    watch: {
        __child({value, rule}) {
            rule.children[0].children[0] = value;
        },
    },
    attrs: {
        child({rule}) {
            return rule.children[0].children[0] || '';
        },
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {type: 'input', field: 'label'}, {
                type: 'input',
                field: '__child',
                _fc_important_prop: 'formCreateChild',
            }, {
                type: 'inputNumber',
                field: 'span'
            }, {
                type: 'input',
                field: 'width'
            }, {
                type: 'input',
                field: 'minWidth'
            }, {
                type: 'select', field: 'align',
                options: localeOptions(t, [{label: 'left', value: 'left'}, {label: 'center', value: 'center'}, {
                    label: 'right',
                    value: 'right'
                }])
            }, {
                type: 'select', field: 'labelAlign',
                options: localeOptions(t, [{label: 'left', value: 'left'}, {label: 'center', value: 'center'}, {
                    label: 'right',
                    value: 'right'
                }])
            }, {type: 'input', field: 'className'}]);
    }
};
