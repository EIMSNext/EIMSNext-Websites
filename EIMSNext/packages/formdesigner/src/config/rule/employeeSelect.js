import { uniqueId } from "@eimsnext/form-render-core";
import { makeTitleRule, localeProps } from "../../utils";

const label = "成员单选";
const name = "employeeSelect";

export default {
  menu: "main",
  icon: "icon-select",
  label,
  name,
  input: true,
  event: ["change"],
  validate: ["object"],
  rule({ t }) {
    return {
      type: name,
      field: uniqueId(),
      title: t("com.employeeSelect.name"),
      info: "",
      $required: false,
      props: {
        multiple: false,
        placeholder: "+ 选择成员",
      },
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [     
      {
        type: "DefaultValueConfig",
        field: "value",
      },
      {
        type: "CheckBoxInput",
        field: "required",
        wrap: { show: false },
      },
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
      {
        type: "CheckBoxInput",
        field: "hidden",
        wrap: { show: false },
      },
    ]);
  },
};
