const name = 'divider';
const DEFAULT_STYLE = 'solidShort';
const DEFAULT_COLOR = '#C8CDD4';
const DEFAULT_TITLE_COLOR = '#141E31';
const STYLE_NAMES = [
  'plain',
  'dash',
  'solidShort',
  'solidFull',
  'ribbonSlash',
  'pillShort',
  'pillFill',
  'sideBar',
  'slashGradient',
  'arrowLine',
  'centerChevrons',
  'centerTab',
  'diamondLine',
];

const getStyleName = (style) => STYLE_NAMES.indexOf(style) > -1 ? style : DEFAULT_STYLE;

export default {
  name,
  mergeProp(ctx) {
    const props = ctx.prop.props || {};
    const dividerStyle = getStyleName(props.dividerStyle);
    const dividerColor = props.dividerColor || DEFAULT_COLOR;
    const dividerTitleColor = props.dividerTitleColor || DEFAULT_TITLE_COLOR;
    const hasTitle = (ctx.rule.children || []).some((child) => typeof child === 'string' && child);

    delete props.dividerStyle;
    delete props.dividerColor;
    delete props.dividerTitleColor;
    delete props.direction;
    delete props.contentPosition;
    delete props.formCreateChild;

    ctx.prop.props = props;
    ctx.prop.class = [
      ctx.prop.class,
      'fc-divider-enhanced',
      `fc-divider-style-${dividerStyle}`,
      !hasTitle && 'fc-divider-no-title',
    ].filter(Boolean);
    ctx.prop.style = [
      ctx.prop.style,
      {
        '--fc-divider-color': dividerColor,
        '--fc-divider-title-color': dividerTitleColor,
      },
    ];
  },
};
