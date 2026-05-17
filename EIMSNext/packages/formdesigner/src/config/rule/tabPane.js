import { localeProps } from "../../utils";
import { uniqueId8 } from "@eimsnext/form-render-core";

const label = "选项卡";
const name = "elTabPane";

export default {
  label,
  name,
  inside: true,
  drag: true,
  dragBtn: false,
  mask: false,
  rule({ t }) {
    return {
      type: name,
      props: {
        label: t("com.elTabPane.name"),
        name: uniqueId8(),
      },
      children: [],
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      { type: "input", field: "label" },
      //   { type: "input", field: "name" },
      // {
      //   type: "CheckBoxInput",
      //   field: "lazy",
      //   wrap: { show: false },
      // },
      {
        type: "CheckBoxInput",
        field: "disabled",
        wrap: { show: false },
      },
      //   {
      //     type: "switch",
      //     field: "lazy",
      //   },
      //   {
      //     type: "switch",
      //     field: "disabled",
      //   },
    ]);
  },
};
