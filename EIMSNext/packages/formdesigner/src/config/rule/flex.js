const label = '盒子布局';
const name = 'fcFlex';

export default {
    icon: 'icon-flex',
    label,
    name,
    mask: false,
    children: 'fcCell',
    childrenLen: 2,
    subRender({t, h, resolveComponent, subRule}) {
        return [
            {
                label: t('style.width'),
                vnode: h(resolveComponent('SizeInput'), {
                    size: 'small',
                    modelValue: (subRule.style && subRule.style.width) || '',
                    'onUpdate:modelValue': (v) => {
                        if (!subRule.style) {
                            subRule.style = {};
                        }
                        subRule.style.width = v;
                    }
                })
            },
            {
                label: t('style.height'),
                vnode: h(resolveComponent('SizeInput'), {
                    size: 'small',
                    modelValue: (subRule.style && subRule.style.height) || 'auto',
                    'onUpdate:modelValue': (v) => {
                        if (!subRule.style) {
                            subRule.style = {};
                        }
                        subRule.style.height = v;
                    }
                })
            },
        ]
    },
    sfc(rule) {
        rule.type = 'elRow';
    },
    rule() {
        return {
            type: 'fcRow',
            props: {},
            children: []
        };
    },
    props() {
        return [];
    }
};
