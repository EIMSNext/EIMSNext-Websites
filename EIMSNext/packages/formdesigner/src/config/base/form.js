import { isNull, localeOptions } from "../../utils";
import { uniqueId } from "@eimsnext/form-render-core";

function updateConfigInfo(key, t) {
  return function (val, rule, api) {
    const temp = { ...(val || {}) };
    Object.keys(temp).forEach((k) => {
      if (isNull(temp[k])) {
        delete temp[k];
      }
    });
    api.getRule(key).props.info =
      Object.keys(temp).length > 0 ? t("struct.configured") : "";
  };
}

export default function form({ t }) {
  const key1 = uniqueId();

  return [
    // {
    //     type: 'input',
    //     field: '>formName',
    //     value: '',
    //     title: t('form.formName'),
    // },
    {
      type: "radio",
      field: "labelPosition",
      value: "left",
      title: t("form.labelPosition"),
      options: localeOptions(t, [
        { value: "left", label: "left" },
        { value: "right", label: "right" },
        { value: "top", label: "top" },
      ]),
    },
    // {
    //   type: "radio",
    //   field: "size",
    //   value: "small",
    //   title: t("form.size"),
    //   options: localeOptions(t, [
    //     { value: "large", label: "large" },
    //     { value: "default", label: "default" },
    //     { value: "small", label: "small" },
    //   ]),
    // },
    // {
    //   type: "input",
    //   field: "labelSuffix",
    //   value: "",
    //   title: t("form.labelSuffix"),
    //   style: {
    //     width: "150px",
    //   },
    // },
    // {
    //   type: "SizeInput",
    //   field: "labelWidth",
    //   value: "125px",
    //   title: t("form.labelWidth"),
    // },
    {
      type: "SizeInput",
      field: "wrap>style>marginBottom",
      value: "",
      title: t("form.formItemMarginBottom"),
    },
    // {
    //   type: "switch",
    //   field: "hideRequiredAsterisk",
    //   value: false,
    //   title: t("form.hideRequiredAsterisk"),
    // },
    {
      type: "CheckBoxInput",
      field: "hideRequiredAsterisk",
      value: false,
      props: { title: "form.hideRequiredAsterisk" },
      wrap: { show: false },
    },
    // {
    //   type: "switch",
    //   field: "showMessage",
    //   value: true,
    //   title: t("form.showMessage"),
    // },
    {
      type: "CheckBoxInput",
      field: "showMessage",
      value: true,
      props: { title: "form.showMessage" },
      wrap: { show: false },
    },
    // {
    //   type: "switch",
    //   field: "inlineMessage",
    //   value: false,
    //   title: t("form.inlineMessage"),
    // },
    {
      type: "CheckBoxInput",
      field: "inlineMessage",
      value: false,
      props: { title: "form.inlineMessage" },
      wrap: { show: false },
    },
    // {
    //   type: "switch",
    //   field: "_submitBtn>show",
    //   value: false,
    //   title: t("form.submitBtn"),
    // },
    // {
    //   type: "switch",
    //   field: "_resetBtn>show",
    //   value: false,
    //   title: t("form.resetBtn"),
    // },
    // {
    //   type: "switch",
    //   field: ">ignoreHiddenFields",
    //   value: false,
    //   title: t("form.ignoreHiddenFields"),
    //   warning: t("warning.ignoreHiddenFields"),
    // },
    // {
    //   type: "ConfigItem",
    //   col: { show: true },
    //   name: key1,
    //   style: "margin-bottom: 10px",
    //   props: {
    //     label: t("form.labelStyle"),
    //     info: "",
    //   },
    //   children: [
    //     {
    //       type: "StyleConfig",
    //       field: "title>style",
    //       wrap: { show: false },
    //       value: {},
    //       slot: "append",
    //       update: updateConfigInfo(key1, t),
    //     },
    //   ],
    // },
    {
      type: "FnConfig",
      field: ">_event",
      value: {},
      col: { show: true },
      props: {
        eventConfig: [
          {
            name: "onSubmit",
            info: t("form.onSubmit"),
            args: ["formData", "api"],
          },
          {
            name: "onReset",
            info: t("form.onReset"),
            args: ["api"],
          },
          {
            name: "onCreated",
            info: t("form.onCreated"),
            args: ["api"],
          },
          {
            name: "onMounted",
            info: t("form.onMounted"),
            args: ["api"],
          },
          {
            name: "onReload",
            info: t("form.onReload"),
            args: ["api"],
          },
          {
            name: "onChange",
            info: t("form.onChange"),
            args: ["field", "value", "options"],
          },
          {
            name: "beforeFetch",
            info: t("form.beforeFetch"),
            args: ["config", "data"],
          },
        ],
      },
      title: t("form.event"),
    },
  ];
}
