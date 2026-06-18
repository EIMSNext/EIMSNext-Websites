import { uniqueId8 } from "@eimsnext/form-render-core";
import { localeProps } from "../../utils";

const label = "Data Select";
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
      title: t("com.dataselect.name"),
      info: "",
      $required: false,
      props: {
        placeholder: t("com.dataselect.selectData"),
        dataSource: "",
        selectionProcess: {
          buttonText: t("com.dataselect.selectData"),
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
        title: t("com.dataselect.dataSource"),
        props: {
          placeholder: t("dataflow.selectForm"),
          sourceScope: "crossApp",
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
              { type: "GroupLabel", props: { title: t("com.dataselect.selectionProcess") } },
              {
                type: "SelectionProcessConfig",
                field: "selectionProcess",
                title: "",
                props: {
                  btn: t("admin.appAdmin.set"),
                },
              },
              { type: "GroupLabel", props: { title: t("com.dataselect.afterSelection") } },
              {
                type: "DisplayFieldsConfig",
                field: "displayConfig",
                title: "",
                props: {
                  btn: t("com.dataselect.setDisplayFields"),
                },
              },
              {
                type: "FillFieldsConfig",
                field: "fillConfig",
                title: "",
                props: {
                  btn: t("com.dataselect.fillRuleSettings"),
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
