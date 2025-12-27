import { uniqueId } from "@eimsnext/form-render-core";
import { localeOptions, localeProps } from "../../utils";
import { valueEquals } from "element-plus";

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
      props: { controls: true, controlsPosition: "right" },
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      { type: "input", field: "placeholder" },
      {
        type: "CheckBoxInput",
        field: "controls",
        wrap: { show: false },
      },
      { type: "inputNumber", field: "step", value: 1, props: { min: 0 } },
      // {
      //   type: "CheckBoxInput",
      //   field: "disabled",
      //   wrap: { show: false },
      // },
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
      // {
      //     type: 'switch',
      //     field: 'stepStrictly'
      // },
      // {
      //   type: "switch",
      //   field: "controls",
      //   value: true,
      // },
      // {
      //   type: "select",
      //   field: "controlsPosition",
      //   options: localeOptions(t, [
      //     { label: "default", value: "" },
      //     { label: "right", value: "right" },
      //   ]),
      // },
      {
        type: "CheckBoxInput",
        field: "readonly",
        wrap: { show: false },
      },
      {
        type: "CheckBoxInput",
        field: "disabled",
        wrap: { show: false },
      },
    ]);
  },
};
