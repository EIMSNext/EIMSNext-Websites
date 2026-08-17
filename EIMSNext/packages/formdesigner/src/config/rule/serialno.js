import { uniqueId8 } from "@eimsnext/form-render-core";
import { localeProps } from "../../utils";

const label = "流水号";
const name = "serialno";

export default {
  menu: "subform",
  icon: "icon-input",
  label,
  name,
  input: true,
  validate: false,
  hiddenBaseField: ["info"],
  rule({ t }) {
    return {
      type: name,
      field: `f_${uniqueId8()}`,
      title: t("com.serialno.name"),
      info: "",
      $required: false,
      props: {
        placeholder: t("com.serialno.placeholder"),
        segments: [
          {
            id: "seg_" + uniqueId8(),
            type: "counter",
            digits: 5,
            padZero: true,
            reset: "never",
            start: 1,
          },
        ],
      },
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      { type: "SerialNoSegments", field: "segments" },
      { type: "GroupLabel", props: { title: t("com.serialno.resetNote") } },
      { type: "input", field: "placeholder" },
      { type: "DefaultValueConfig" },
      { type: "CheckBoxInput", field: "disabled", wrap: { show: false } },
    ]);
  },
};
