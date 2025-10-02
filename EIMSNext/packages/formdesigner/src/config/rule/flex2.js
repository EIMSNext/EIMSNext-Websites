const label = '盒子布局';
const name = 'fcFlex2';


export default {
    menu: 'layout',
    icon: 'icon-flex',
    name,
    label,
    drag: true,
    inside: true,
    inline: true,
    mask: false,
    sfc(rule) {
        rule.type = 'div';
    },
    actions: [
        {
            label: 'com.fcFlex2.horizontal',
            handler(rule) {
                if (!rule.style) {
                    rule.style = {};
                }
                if (rule.style.display !== 'flex') {
                    rule.style.display = 'flex';
                    rule.style.flexDirection = 'row';
                    rule.style.justifyContent = 'center';
                } else if (['column-reverse', 'column'].indexOf(rule.style.flexDirection) > -1) {
                    rule.style.alignItems = 'center';
                } else {
                    rule.style.justifyContent = 'center';
                }
            }
        },
        {
            label: 'com.fcFlex2.vertical',
            handler(rule) {
                if (!rule.style) {
                    rule.style = {};
                }
                if (rule.style.display !== 'flex') {
                    rule.style.display = 'flex';
                    rule.style.flexDirection = 'row';
                    rule.style.alignItems = 'center';
                } else if (['column-reverse', 'column'].indexOf(rule.style.flexDirection) > -1) {
                    rule.style.justifyContent = 'center';
                } else {
                    rule.style.alignItems = 'center';
                }
            }
        },
        {
            label: 'com.fcFlex2.left',
            handler(rule) {
                if (!rule.style) {
                    rule.style = {};
                }
                if (rule.style.display !== 'flex') {
                    rule.style.display = 'flex';
                    rule.style.flexDirection = 'row';
                    rule.style.justifyContent = 'flex-start';
                } else if (['column-reverse', 'column'].indexOf(rule.style.flexDirection) > -1) {
                    rule.style.alignItems = 'flex-start';
                } else {
                    rule.style.justifyContent = 'flex-start';
                }
            }
        },
        {
            label: 'com.fcFlex2.right',
            handler(rule) {
                if (!rule.style) {
                    rule.style = {};
                }
                if (rule.style.display !== 'flex') {
                    rule.style.display = 'flex';
                    rule.style.flexDirection = 'row';
                    rule.style.justifyContent = 'flex-end';
                } else if (['column-reverse', 'column'].indexOf(rule.style.flexDirection) > -1) {
                    rule.style.alignItems = 'flex-end';
                } else {
                    rule.style.justifyContent = 'flex-end';
                }
            }
        },
        {
            label: 'com.fcFlex2.reset',
            handler(rule) {
                if (!rule.style) {
                    rule.style = {};
                } else {
                    delete rule.style.flexDirection;
                    delete rule.style.justifyContent;
                    delete rule.style.alignContent;
                    delete rule.style.flexWrap;
                    delete rule.style.alignItems;
                    rule.style.display = 'flex';
                }
            }
        },
    ],
    rule() {
        return {
            type: 'fcCell',
            style: {
                display: 'block',
                width: '100%',
                height: '100px',
            },
            children: [],
        };
    },
    props(_, {t}) {
        return [{
            type: 'SizeInput',
            field: 'formCreateStyle>width',
            title: t('style.width')
        }, {
            type: 'SizeInput',
            field: 'formCreateStyle>height',
            title: t('style.height')
        }]
    }
};
