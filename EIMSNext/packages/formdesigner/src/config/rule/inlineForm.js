const label = '内联布局';
const name = 'fcInlineForm';

export default {
    menu: 'layout',
    icon: 'icon-inline',
    label,
    name,
    denyDrag: {
        menu: ['subform', 'layout']
    },
    drag: true,
    inside: false,
    mask: false,
    sfc: {
        style: `._fc-line-form .el-form-item {
    display: inline-flex;
    vertical-align: middle;
}

._fc-line-form .el-select, ._fc-line-form .el-slider {
    width: 220px;
}`,
        handle(rule) {
            return {
                type: 'div',
                class: '_fc-line-form',
                children: rule.children
            };
        }
    },
    rule() {
        return {
            type: name,
            props: {},
        };
    },
    props() {
        return [];
    }
};
