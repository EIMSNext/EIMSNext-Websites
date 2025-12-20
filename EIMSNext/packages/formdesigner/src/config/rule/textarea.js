import { uniqueId } from "@eimsnext/form-render-core";
import { localeProps } from "../../utils";

const label = "多行输入框";
const name = "textarea";

export default {
  menu: "main",
  icon: "icon-textarea",
  label,
  name,
  input: true,
  event: ["blur", "focus", "change", "input"],
  validate: ["string"],
  rule({ t }) {
    return {
      type: "textarea",
      field: uniqueId(),
      title: t("com.textarea.name"),
      info: "",
      $required: false,
      props: {
        type: "textarea",
      },
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      // {
      //     type: 'switch',
      //     field: 'disabled'
      // },
      {
        type: "CheckBoxInput",
        field: "disabled",
        wrap: { show: false },
      },
      // {
      //     type: 'switch',
      //     field: 'readonly'
      // },
      {
        type: "CheckBoxInput",
        field: "readonly",
        wrap: { show: false },
      },
      // {
      //     type: 'inputNumber',
      //     field: 'maxlength',
      //     props: {min: 0}
      // },
      // {
      //     type: 'switch',
      //     field: 'showWordLimit'
      // },
      {
        type: "input",
        field: "placeholder",
      },
      {
        type: "inputNumber",
        field: "rows",
        props: {
          min: 0,
        },
      },
      // {
      //     type: 'switch',
      //     field: 'autosize'
      // },
    ]);
  },
};
