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
  validate: ["array"],
  rule({ t }) {
    return {
      type: name,
      field: uniqueId(),
      title: t("com.departmentSelect2.name"),
      info: "",
      $required: false,
      props: {
        multiple: true,
        placeholder: "+ 选择部门",
        selectScope: "all",
        scopeDepartments: []
      },
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      {
        type: "DefaultValueConfig",
      },
      { type: "select",
        field: "selectScope",
        title: "可选范围",
        options: [
          { label: "全部部门", value: "all" },
          { label: "自定义", value: "custom" }
        ],
        control: [
          {
            value: "custom",
            rule: [
              {
                type: "departmentSelect",
                field: "scopeDepartments",
                title: "",
                wrap: { class: "_fd-default-value" },
                props: {
                  placeholder: "+选择部门",
                  mode: "custom",
                  showTags: true
                }
              }
            ]
          }
        ]
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
      }
    ]);
  },
};
