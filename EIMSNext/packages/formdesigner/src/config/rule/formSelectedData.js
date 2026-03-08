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
        type: "select",
        field: "dataSource",
        title: "选择表单",
        options: [
          { label: "未命名表单1", value: "form1" },
          { label: "未命名表单2", value: "form2" },
          { label: "未命名表单3", value: "form3" }
        ],
        props: {
          placeholder: "请选择表单"
        },
        control: [
          {
            value: "form1",
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
                type: "button",
                field: "displayFields",
                title: "",
                props: {
                  type: "primary",
                  plain: true
                },
                children: ["设置显示字段"],
                wrap: {
                  class: "_fd-button-full-width _fd-plain-button"
                }
              },
              {
                type: "button",
                field: "fillFields",
                title: "",
                props: {
                  type: "primary",
                  plain: true
                },
                children: ["填充规则设置"],
                wrap: {
                  class: "_fd-button-full-width _fd-plain-button"
                }
              }
            ]
          },
          {
            value: "form2",
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
                type: "button",
                field: "displayFields",
                title: "",
                props: {
                  type: "primary",
                  plain: true
                },
                children: ["设置显示字段"],
                wrap: {
                  class: "_fd-button-full-width _fd-plain-button"
                }
              },
              {
                type: "button",
                field: "fillFields",
                title: "",
                props: {
                  type: "primary",
                  plain: true
                },
                children: ["填充规则设置"],
                wrap: {
                  class: "_fd-button-full-width _fd-plain-button"
                }
              }
            ]
          },
          {
            value: "form3",
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
                type: "button",
                field: "displayFields",
                title: "",
                props: {
                  type: "primary",
                  plain: true
                },
                children: ["设置显示字段"],
                wrap: {
                  class: "_fd-button-full-width _fd-plain-button"
                }
              },
              {
                type: "button",
                field: "fillFields",
                title: "",
                props: {
                  type: "primary",
                  plain: true
                },
                children: ["填充规则设置"],
                wrap: {
                  class: "_fd-button-full-width _fd-plain-button"
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
