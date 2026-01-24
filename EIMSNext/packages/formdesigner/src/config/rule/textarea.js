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
        clearable: true,
      },
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      {
        type: "input",
        field: "placeholder",
      },
      {
        type: "DefaultValueConfig",
      },
      // {
      //   type: "inputNumber",
      //   field: "maxlength",
      //   value: 500,
      //   props: { min: 0 },
      // },
      // {
      //   type: "CheckBoxInput",
      //   field: "readonly",
      //   wrap: { show: false },
      // },
      // {
      //   type: "CheckBoxInput",
      //   field: "clearable",
      //   wrap: { show: false },
      // },
      { type: "GroupLabel", props: { title: t("props.othersetting") } },
      {
        type: "CheckBoxInput",
        field: "disabled",
        wrap: { show: false },
      },
    ]);
  },
};
