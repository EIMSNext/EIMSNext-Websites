import { uniqueId } from "@eimsnext/form-render-core";
import { makeTitleRule, localeProps } from "../../utils";

const label = "成员多选";
const name = "employeeselect2";

export default {
  menu: "main",
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
      title: t("com.employeeselect2.name"),
      info: "",
      $required: false,
      props: {
        multiple: true,
        placeholder: t("comp.emptyEmp"),
        limitType: "all",
        limitScope: [],
      },
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      {
        type: "DefaultValueConfig",
      },
      {
        type: "select",
        field: "limitType",
        title: t("comp.availableScope"),
        options: [
          { label: t("comp.allEmps"), value: "all" },
          { label: t("props.custom"), value: "custom" },
        ],
        control: [
          {
            value: "custom",
            rule: [
              {
                type: "FcDepartmentSelect",
                field: "limitScope",
                title: "",
                wrap: { class: "_fd-default-value" },
                props: {
                  multiple: true,
                },
              },
            ],
          },
        ],
      },
      // {
      //   type: "CheckBoxInput",
      //   field: "readonly",
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
