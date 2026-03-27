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
        dataSource: "",
      },
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      { type: "GroupLabel", props: { title: "数据源" } },
      {
        type: "FormSelect",
        field: "dataSource",
        title: "选择表单",
        props: {
          placeholder: "请选择表单"
        },
        control: [
          {
            condition: "empty",
            value: "",
            rule: []
          },
          {
            condition: "notEmpty",
            value: "",
            rule: [
              { type: "GroupLabel", props: { title: "数据选择过程" } },
              {
                type: "SelectionProcessConfig",
                field: "selectionProcess",
                title: "",
                props: {
                  btn: "设置"
                }
              },
              { type: "GroupLabel", props: { title: "数据选择后" } },
              {
                type: "DisplayFieldsConfig",
                field: "displayFields",
                title: "",
                props: {
                  btn: "设置显示字段"
                }
              },
              {
                type: "FillFieldsConfig",
                field: "fillFields",
                title: "",
                props: {
                  btn: "填充规则设置"
                }
              }
            ]
          }
        ]
      },
      { type: "GroupLabel", props: { title: t("props.othersetting") } },
      {
        type: "CheckBoxInput",
        field: "disabled",
        wrap: { show: false },
      },
    ]);
  },
};
