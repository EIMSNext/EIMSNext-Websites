const name = 'fcCell';

export default {
    name,
    label: '格子',
    drag: true,
    dragBtn: false,
    inside: true,
    inline: true,
    mask: false,
    sfc(rule) {
        rule.type = 'div';
    },
    rule() {
        return {
            type: name,
            style: {
                display: 'block',
                width: '50%',
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
        }]
    }
};
