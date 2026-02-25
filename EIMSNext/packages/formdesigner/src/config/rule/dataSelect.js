import { uniqueId } from "@eimsnext/form-render-core";
import { makeTitleRule, localeProps } from "../../utils/index";

const label = "选择数据";
const name = "dataSelect";

export default {
  menu: "subform",
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
      title: t("com.dataSelect.name"),
      info: "",
      $required: false,
      props: {
        placeholder: t("comp.emptySelect"),
        dataSource: "",
        buttonText: t("com.dataSelect.buttonText"),
      },
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      ...makeTitleRule(t),
      {
        type: "DefaultValueConfig",
      },
      {
        type: "FormSelect",
        field: "dataSource",
        title: "数据源",
        required: true,
        props: {
          appId: "{{ $root.$route.params.id }}",
        },
        on: {
          "update:buttonText": "$value.buttonText = $event",
          "update:buttonTextField": "$value.buttonText = $event"
        },
        control: [
          {
            value: "",
            rule: [],
          },
          {
            value: "*",
            rule: [
              {
                type: "input",
                field: "buttonText",
                title: "按钮文字",
                props: {
                  placeholder: "请输入按钮文字",
                },
              },
              {
                type: "button",
                field: "dataSelectConfig",
                title: "数据选择",
                props: {
                  btnText: "设置",
                },
              },
              {
                type: "GroupLabel",
                props: {
                  title: "数据选择后",
                },
              },
              {
                type: "button",
                field: "displayConfig",
                title: "显示在表单中",
                props: {
                  btnText: "设置显示字段",
                },
              },
              {
                type: "button",
                field: "fillConfig",
                title: "填充到表单字段",
                props: {
                  btnText: "填充规则设置",
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
        title: "禁用",
        wrap: { show: false },
      },
    ]);
  },
};
