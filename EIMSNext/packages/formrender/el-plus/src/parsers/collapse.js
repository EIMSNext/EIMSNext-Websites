const name = 'collapse';
const DEFAULT_STYLE = 'underline';
const DEFAULT_COLOR = 'var(--et-color-primary, #4080ff)';
const STYLE_NAMES = ['underline', 'card', 'boxed', 'filled', 'pill'];

const getStyleName = (style) => (STYLE_NAMES.indexOf(style) > -1 ? style : DEFAULT_STYLE);

export default {
    name,
    mergeProp(ctx) {
        const props = ctx.prop.props || {};
        const collapseStyle = getStyleName(props.collapseStyle);
        const collapseColorCustom = props.collapseColorCustom === true || props.collapseColorCustom === 'true';
        const collapseColor = collapseColorCustom && props.collapseColor ? props.collapseColor : DEFAULT_COLOR;

        delete props.collapseStyle;
        delete props.collapseColor;
        delete props.collapseColorCustom;
        // accordion 是 el-collapse 原生 prop，保留透传，不在这里删除。

        ctx.prop.props = props;
        ctx.prop.class = [
            ctx.prop.class,
            'fc-collapse-enhanced',
            `fc-collapse-style-${collapseStyle}`,
        ].filter(Boolean);
        ctx.prop.style = [
            ctx.prop.style,
            {
                '--fc-collapse-color': collapseColor,
            },
        ];
    },
};
