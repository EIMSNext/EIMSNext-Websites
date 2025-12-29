import { localeOptions, localeProps } from "../../utils";

const label = "标签页";
const name = "elTabs";

export default {
  menu: "layout",
  icon: "icon-tab",
  label,
  name,
  mask: false,
  event: ["tabClick", "tabChange", "tabRemove", "tabAdd", "edit"],
  children: "elTabPane",
  subRender({ t, h, resolveComponent, subRule }) {
    return [
      {
        label: t("props.title"),
        vnode: h(resolveComponent("el-input"), {
          size: "small",
          modelValue: subRule.props.label,
          "onUpdate:modelValue": (v) => {
            subRule.props.label = v;
          },
        }),
      },
    ];
  },
  rule() {
    return {
      type: name,
      style: { width: "100%" },
      props: {
        modelValue: "0",
      },
      sync: ["modelValue"],
      children: [],
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      {
        type: "select",
        field: "type",
        options: [
          {
            label: "card",
            value: "card",
          },
          { label: "border-card", value: "border-card" },
        ],
      },
      {
        type: "select",
        field: "tabPosition",
        options: localeOptions(t, [
          { label: "top", value: "top" },
          { label: "right", value: "right" },
          {
            label: "left",
            value: "left",
          },
        ]),
      },
      {
        type: "CheckBoxInput",
        field: "stretch",
        wrap: { show: false },
      },
      {
        type: "CheckBoxInput",
        field: "closable",
        wrap: { show: false },
      },
      //   { type: "switch", field: "closable" },
      //   { type: "switch", field: "stretch" },
    ]);
  },
};
