const DEFAULT_STYLE = "solidShort";
const STYLE_NAMES = [
  "plain",
  "dash",
  "solidShort",
  "solidFull",
  "ribbonSlash",
  "pillShort",
  "pillFill",
  "sideBar",
  "slashGradient",
  "arrowLine",
  "centerChevrons",
  "centerTab",
  "diamondLine",
];

export default {
  name: "divider",
  mergeProp(ctx) {
    const props = ctx.prop.props || {};
    const dividerStyle = STYLE_NAMES.includes(props.dividerStyle)
      ? props.dividerStyle
      : DEFAULT_STYLE;
    const hasTitle = (ctx.rule.children || []).some(
      (child) => typeof child === "string" && child,
    );
    ctx.prop.class = [
      ctx.prop.class,
      "fc-divider-enhanced",
      `fc-divider-style-${dividerStyle}`,
      !hasTitle && "fc-divider-no-title",
    ].filter(Boolean);
    ctx.prop.style = [
      ctx.prop.style,
      {
        "--fc-divider-color": props.dividerColor || "#c8cdd4",
        "--fc-divider-title-color": props.dividerTitleColor || "#141e31",
      },
    ];
    delete props.dividerStyle;
    delete props.dividerColor;
    delete props.dividerTitleColor;
    delete props.direction;
    delete props.contentPosition;
    delete props.formCreateChild;
  },
};
