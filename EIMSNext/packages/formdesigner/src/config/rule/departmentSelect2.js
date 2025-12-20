import { uniqueId } from "@eimsnext/form-render-core";
import { makeTitleRule, localeProps } from "../../utils";

const label = "部门多选";
const name = "departmentSelect2";

export default {
  menu: "main",
  icon: "icon-select",
  label,
  name,
  input: true,
  event: ["change"],
  validate: ["string", "array"],
  rule({ t }) {
    return {
      type: name,
      field: uniqueId(),
      title: t("com.departmentSelect2.name"),
      info: "",
      $required: false,
      props: {
        multiple: true,
        placeholder: "+选择部门",
      },
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      makeTitleRule(t),
      {
        type: "input",
        field: "placeholder",
        title: t("props.placeholder"),
      },
      {
        type: "CheckBoxInput",
        field: "disabled",
        wrap: { show: false },
        title: t("props.disabled"),
      },
    ]);
  },
};
