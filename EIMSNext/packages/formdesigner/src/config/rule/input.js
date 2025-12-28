import { uniqueId } from "@eimsnext/form-render-core";
import { localeOptions, localeProps } from "../../utils";

const label = "输入框";
const name = "input";

export default {
  menu: "main",
  icon: "icon-input",
  label,
  name,
  input: true,
  // easySlots: ["prefix", "suffix", "prepend", "append"],
  event: ["blur", "focus", "change", "input", "clear"],
  validate: ["string"], //, "url", "email"],
  rule({ t }) {
    return {
      type: name,
      field: uniqueId(),
      title: t("com.input.name"),
      info: "",
      $required: false,
      props: { clearable: true },
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      {
        type: "input",
        field: "placeholder",
      },
      // {
      //   type: "select",
      //   field: "type",
      //   value: "text",
      //   options: localeOptions(t, [
      //     { label: "text", value: "text" },
      //     { label: "email", value: "email" },
      //     { label: "phone", value: "phone" },
      //     // {label: 'time', value: 'time'},
      //     // {label: 'date', value: 'date'},
      //     // {label: 'month', value: 'month'},
      //     // {label: 'datetime-local', value: 'datetime-local'},
      //   ]),
      // },
      {
        type: "DefaultValueConfig",
      },
      // {
      //   type: "inputNumber",
      //   field: "maxlength",
      //   props: { min: 0 },
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
