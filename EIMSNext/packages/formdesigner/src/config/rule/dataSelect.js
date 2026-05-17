import { uniqueId8 } from "@eimsnext/form-render-core";
import { localeProps } from "../../utils";

const label = "选择数据";
const name = "dataselect";

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
      field: `f_${uniqueId8()}`,
      title: t("com.formselecteddata.name"),
      info: "",
      $required: false,
      props: {
        placeholder: "选择数据",
        dataSource: "",
        selectionProcess: {
          buttonText: "选择数据",
          tableFields: [],
        },
        displayConfig: {
          fields: [],
        },
        fillConfig: {
          mappings: [],
        },
      },
    };
  },
  props(_, { t }) {
    return localeProps(t, `${name}.props`, [
      {
        type: "FormSelect",
        field: "dataSource",
        title: "数据源",
        props: {
          placeholder: "请选择表单",
        },
        control: [
          {
            condition: "empty",
            value: "",
            rule: [],
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
                  btn: "设置",
                },
              },
              { type: "GroupLabel", props: { title: "数据选择后" } },
              {
                type: "DisplayFieldsConfig",
                field: "displayConfig",
                title: "",
                props: {
                  btn: "设置显示字段",
                },
              },
              {
                type: "FillFieldsConfig",
                field: "fillConfig",
                title: "",
                props: {
                  btn: "填充规则设置",
                },
              },
            ],
          },
        ],
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
