import { uniqueId8 } from "@eimsnext/form-render-core";
import { localeProps } from "../../utils";

const label = "查询";
const name = "query";

export default {
  menu: "subform",
  icon: "icon-search",
  label,
  name,
  // The component is a display field. It intentionally never emits a model value.
  input: true,
  validate: false,
  hiddenBaseField: ["info"],
  rule({ t }) {
    return {
      type: name,
      field: `f_${uniqueId8()}`,
      title: t("com.query.name"),
      info: "",
      $required: false,
      props: {
        dataSource: "",
        resultMode: "single",
        displayConfig: { fields: [] },
        filterConfig: { id: "", rel: "and", items: [] },
      },
    };
  },
  props(_, { t }) {
    return localeProps(t, `${name}.props`, [
      {
        type: "FormSelect",
        field: "dataSource",
        title: t("com.query.dataSource"),
        props: {
          placeholder: t("com.query.selectForm"),
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
              { type: "GroupLabel", props: { title: t("com.query.resultDisplay") } },
              {
                type: "radio",
                field: "resultMode",
                title: t("com.query.resultCount"),
                value: "single",
                options: [
                  { label: t("com.query.single"), value: "single" },
                  { label: t("com.query.multiple"), value: "multiple" },
                ],
                props: { type: "button" },
              },
              {
                type: "DisplayFieldsConfig",
                field: "displayConfig",
                title: t("com.query.displayFields"),
                props: { btn: t("com.query.setDisplayFields") },
              },
              {
                type: "QueryFilterConfig",
                field: "filterConfig",
                title: t("com.query.filter"),
                props: { btn: t("com.query.addFilter") },
              },
            ],
          },
        ],
      },
    ]);
  },
};
