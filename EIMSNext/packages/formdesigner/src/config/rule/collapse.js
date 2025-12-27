import { localeProps } from "../../utils";

const label = "折叠面板";
const name = "elCollapse";

export default {
  menu: "layout",
  icon: "icon-collapse",
  label,
  name,
  mask: false,
  children: "elCollapseItem",
  subRender({ t, h, resolveComponent, subRule }) {
    return [
      {
        label: t("props.title"),
        vnode: h(resolveComponent("el-input"), {
          size: "small",
          modelValue: subRule.props.title,
          "onUpdate:modelValue": (v) => {
            subRule.props.title = v;
          },
        }),
      },
    ];
  },
  event: ["change"],
  rule() {
    return {
      type: name,
      props: {
        modelValue: [],
      },
      sync: ["modelValue"],
      style: {
        width: "100%",
      },
      children: [],
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      {
        type: "CheckBoxInput",
        field: "accordion",
        wrap: { show: false },
      },
      //   {
      //     type: "switch",
      //     field: "accordion",
      //   },
    ]);
  },
};
