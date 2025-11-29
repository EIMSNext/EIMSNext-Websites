import { uniqueId } from "@eimsnext/form-render-core";
import { localeOptions, localeProps } from "../../utils";

const label = "计数器";
const name = "number";

export default {
  menu: "main",
  icon: "icon-number",
  label,
  name,
  input: true,
  // easySlots: ['prefix', 'suffix'],
  event: ["blur", "focus", "change"],
  validate: ["number", "integer", "float"],
  condition: "number",
  rule({ t }) {
    return {
      type: "number",
      field: uniqueId(),
      title: t("com.number.name"),
      info: "",
      $required: false,
      props: {},
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      // { type: "switch", field: "disabled" },
      {
        type: "CheckBoxInput",
        field: "disabled",
        wrap: { show: false },
      },
      {
        type: "inputNumber",
        field: "min",
      },
      {
        type: "inputNumber",
        field: "max",
      },
      {
        type: "inputNumber",
        title: "precision",
        field: "precision",
      },
      { type: "inputNumber", field: "step", props: { min: 0 } },
      // {
      //     type: 'switch',
      //     field: 'stepStrictly'
      // },
      // {
      //   type: "switch",
      //   field: "controls",
      //   value: true,
      // },
      {
        type: "CheckBoxInput",
        field: "controls",
        wrap: { show: false },
      },
      {
        type: "select",
        field: "controlsPosition",
        options: localeOptions(t, [
          { label: "default", value: "" },
          { label: "right", value: "right" },
        ]),
      },
      { type: "input", field: "placeholder" },
    ]);
  },
};
