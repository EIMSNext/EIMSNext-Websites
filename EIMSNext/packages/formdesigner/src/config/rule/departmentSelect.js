import { uniqueId } from "@eimsnext/form-render-core";
import { makeTitleRule, localeProps } from "../../utils";

const label = "部门单选";
const name = "departmentSelect";

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
      title: t("com.departmentSelect.name"),
      info: "",
      $required: false,
      props: {
        multiple: false,
        placeholder: "+ 选择部门",
        selectScope: "all",
        scopeDepartments: []
      },
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      {
        type: "CheckBoxInput",
        field: "disabled",
        wrap: { show: false },
        title: t("props.disabled"),
      },
      {
        type: "select",
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
                props: {
                  placeholder: "+选择部门",
                  mode: "custom",
                  showTags: true
                }
              }
            ]
          }
        ]
      }
    ]);
  },
};
