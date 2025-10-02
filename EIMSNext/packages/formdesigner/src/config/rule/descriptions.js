import {localeOptions, localeProps} from '../../utils';

const label = '描述列表';
const name = 'elDescriptions';

export default {
    menu: 'layout',
    icon: 'icon-descriptions',
    label,
    name,
    mask: false,
    rule() {
        return {
            type: name,
            props: {
                border: true
            },
            style: {
                width: '100%'
            },
            children: []
        };
    },
    children: 'elDescriptionsItem',
    childrenLen: 2,
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
    props(_, {t}) {
        return localeProps(t, name + '.props', [{
            type: 'input',
            field: 'title',
            value: '',
        }, {
            type: 'input',
            field: 'extra',
            value: '',
        }, {
            type: 'inputNumber',
            field: 'column',
            value: 3,
            props: {min: 0}
        }, {
            type: 'switch',
            field: 'border'
        }, {
            type: 'select',
            field: 'direction',
            options: localeOptions(t, [{label: 'vertical', value: 'vertical'}, {
                label: 'horizontal',
                value: 'horizontal'
            }])
        }, {
            type: 'select',
            field: 'size',
            options: localeOptions(t, [{label: 'large', value: 'large'}, {label: 'default', value: 'default'}, {
                label: 'small',
                value: 'small'
            }])
        }]);
    }
};
