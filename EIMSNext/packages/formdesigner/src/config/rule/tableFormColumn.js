import { localeProps } from "../../utils";

const name = "tableFormColumn";

export default {
  icon: "icon-cell",
  name,
  aide: true,
  drag: true,
  dragBtn: false,
  mask: false,
  style: false,
  advanced: false,
  variable: false,
  rule({ t }) {
    return {
      type: name,
      props: {
        label: t("com.tableFormColumn.label"),
        width: "auto",
      },
      children: [],
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      // {
      //   type: "input",
      //   field: "header",
      //   warning: t("com.tableFormColumn.header"),
      // },
      // {
      //   type: "input",
      //   field: "label",
      // },
      // {
      //   type: "select",
      //   field: "fixed",
      //   options: [false, "left", "right"].map((v) => {
      //     return {
      //       label: t("com.dataTable.fixed." + (v || "default")),
      //       value: v,
      //     };
      //   }),
      // },
      // {
      //   type: "input",
      //   field: "width",
      // },
      // {
      //   type: "ColorInput",
      //   field: "color",
      // },
    ]);
  },
};
