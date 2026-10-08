const name = 'tabs';
const DEFAULT_STYLE = 'underline';
const DEFAULT_COLOR = 'var(--et-color-primary, #4080ff)';
const STYLE_NAMES = ['pill', 'underline', 'card', 'boxed', 'filled', 'soft'];

const getStyleName = (style) => (STYLE_NAMES.indexOf(style) > -1 ? style : DEFAULT_STYLE);

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
    },
};
