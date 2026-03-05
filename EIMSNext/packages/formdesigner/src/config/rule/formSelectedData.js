import { uniqueId } from "@eimsnext/form-render-core";
import { makeTitleRule, localeProps } from "../../utils";

const label = "选择数据";
const name = "formselecteddata";

export default {
  menu: "subform",
  icon: "icon-select",
  label,
  name,
  input: true,
  event: ["change"],
  validate: ["array"],
  rule({ t }) {
    return {
      type: name,
      field: uniqueId(),
      title: t("com.formselecteddata.name"),
      info: "",
      $required: false,
      props: {
        placeholder: "选择数据",
      },
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      { type: "GroupLabel", props: { title: t("props.othersetting") } },
      {
        type: "CheckBoxInput",
        field: "disabled",
        wrap: { show: false },
      },
    ]);
  },
};
