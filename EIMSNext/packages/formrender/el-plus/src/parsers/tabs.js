import { uniqueId8 } from '@eimsnext/form-render-core';

const name = 'tabs';
const DEFAULT_STYLE = 'underline';
const DEFAULT_COLOR = 'var(--et-color-primary, #4080ff)';
const STYLE_NAMES = ['underline', 'card', 'boxed', 'filled', 'pill'];

const getStyleName = (style) => (STYLE_NAMES.indexOf(style) > -1 ? style : DEFAULT_STYLE);

// el-tabs 只渲染 name 与 modelValue 相等的面板，其余面板会被置为 display:none。
// 面板 name 丢失/重复，或 modelValue 指向已被删除的面板时，运行态整块内容区空白、
// 设计态内容区高度为 0 导致无法拖入控件，因此渲染前统一补齐。
// 设计态下规则可能被 DragTool/DragBox 包裹，这里先剥一层拿到真正的面板。
const unwrapPane = (child) => {
    if (
        child &&
        (child.type === 'DragTool' || child.type === 'DragBox') &&
        Array.isArray(child.children)
    ) {
        return unwrapPane(child.children[0]);
    }
    return child;
};

const normalizePaneNames = (rule) => {
    const props = rule.props || (rule.props = {});
    const children = Array.isArray(rule.children) ? rule.children : [];
    const names = [];
    children.forEach((item) => {
        const pane = unwrapPane(item);
        if (!pane) {
            return;
        }
        const paneProps = pane.props || (pane.props = {});
        if (!paneProps.name || names.indexOf(paneProps.name) > -1) {
            paneProps.name = uniqueId8();
        }
        names.push(paneProps.name);
    });
    if (names.indexOf(props.modelValue) < 0) {
        props.modelValue = names[0] || '';
    }
};

export default {
    name,
    mergeProp(ctx) {
        const props = ctx.prop.props || {};
        const tabStyle = getStyleName(props.tabStyle);
        const tabColorCustom = props.tabColorCustom === true || props.tabColorCustom === 'true';
        const tabColor = tabColorCustom && props.tabColor ? props.tabColor : DEFAULT_COLOR;

        delete props.tabStyle;
        delete props.tabColor;
        delete props.tabColorCustom;
        // tabPosition 是 el-tabs 原生 prop，保留透传，不在这里删除。

        ctx.prop.props = props;
        ctx.prop.class = [
            ctx.prop.class,
            'fc-tabs-enhanced',
            `fc-tabs-style-${tabStyle}`,
        ].filter(Boolean);
        ctx.prop.style = [
            ctx.prop.style,
            {
                '--fc-tabs-color': tabColor,
            },
        ];
        normalizePaneNames(ctx.prop);
    },
};
