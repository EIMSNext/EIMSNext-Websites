import { localeOptions } from "../../utils";

export default function field({ t }) {
  return [
    {
      type: "FieldInput",
      field: "field",
      value: "",
      title: t("form.field"),
      warning: t("warning.field"),
    },
    {
      type: "LanguageInput",
      field: "title",
      value: "",
      title: t("form.title"),
    },
    {
      type: "SpanInput",
      field: "formCreateCol>span",
      title: t("form.formItemSpan"),
    },
    {
      type: "ConfigItem",
      col: { show: true },
      style: "margin-bottom: 10px",
      name: "ignoreConfig",
      props: {
        label: t("form.ignore"),
        warning: t("warning.ignore"),
      },
      children: [
        {
          type: "switch",
          field: "ignore",
          value: false,
          wrap: { show: false },
          col: { show: false },
        },
      ],
    },
    {
      type: "CheckBoxInput",
      field: "formCreateWrap>title",
      wrap: { show: false },
      value: true,
      props: {
        title: "props.is_showTitle",
      },
    },
    {
      type: "Struct",
      field: "_control",
      name: "control",
      value: [],
      title: t("form.control"),
      warning: t("form.controlDocument", {
        doc:
          '<a target="_blank" href="https://form-create.com/v3/guide/control" style="color: inherit;text-decoration: underline;">' +
          t("form.document") +
          "</a>",
      }),
      props: {
        defaultValue: [],
        validate(val) {
          if (!Array.isArray(val)) return false;
          if (!val.length) return true;
          return !val.some(({ rule }) => {
            return !Array.isArray(rule);
          });
        },
      },
    },
  ];
}
