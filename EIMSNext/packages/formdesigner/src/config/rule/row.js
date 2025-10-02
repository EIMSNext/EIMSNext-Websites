import {localeProps} from '../../utils';

const label = '栅格布局';
const name = 'fcRow';

export default {
    menu: 'layout',
    icon: 'icon-row',
    label,
    name,
    mask: false,
    children: 'col',
    childrenLen: 2,
    subRender({t, h, resolveComponent, subRule}) {
        return [
            {
                label: t('style.width'),
                vnode: h(resolveComponent('el-slider'), {
                    size: 'small',
                    min: 0,
                    max: 24,
                    modelValue: subRule.props.span,
                    'onUpdate:modelValue': (v) => {
                        subRule.props.span = v;
                    }
                })
            }
        ]
    },
    sfc(rule){
        rule.type='elRow'
    },
    rule() {
        return {
            type: name,
            props: {},
            children: []
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [{
            type: 'inputNumber',
            field: 'gutter',
            props: {min: 0}
        }, {
            type: 'switch',
            field: 'type',
            props: {activeValue: 'flex', inactiveValue: 'default'}
        }, {
            type: 'select',
            field: 'justify',
            options: [{label: 'start', value: 'start'}, {label: 'end', value: 'end'}, {
                label: 'center',
                value: 'center'
            }, {label: 'space-around', value: 'space-around'}, {label: 'space-between', value: 'space-between'}]
        }, {
            type: 'select',
            field: 'align',
            options: [{label: 'top', value: 'top'}, {label: 'middle', value: 'middle'}, {
                label: 'bottom',
                value: 'bottom'
            }]
        }]);
    }
};
