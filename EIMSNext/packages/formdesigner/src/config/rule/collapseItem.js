import { localeProps } from "../../utils";
import { uniqueId } from "@eimsnext/form-render-core";

const label = "面板";
const name = "elCollapseItem";

export default {
  icon: "icon-cell",
  label,
  name,
  drag: true,
  dragBtn: false,
  inside: true,
  mask: false,
  easySlots: [{ value: "icon", type: "icon" }],
  rule({ t }) {
    return {
      type: name,
      props: {
        title: t("com.elCollapseItem.name"),
        name: uniqueId(),
      },
      style: {},
      children: [],
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      {
        type: "input",
        field: "title",
      },
      //   {
      //     type: "input",
      //     field: "name",
      //   },
      {
        type: "CheckBoxInput",
        field: "disabled",
        wrap: { show: false },
      },
      //   {
      //     type: "switch",
      //     field: "disabled",
      //   },
    ]);
  },
};
