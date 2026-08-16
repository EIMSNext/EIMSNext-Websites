import { uniqueId8 } from "@eimsnext/form-render-core";
import {
  localeOptions,
  localeProps,
  makeTreeOptions,
} from "../../utils/index";

const label = "单选框";
const name = "radio";

export default {
  menu: "main",
  icon: "icon-radio",
  label,
  name,
  input: true,
  event: ["change"],
  validate: ["string", "number"],
  condition: {
    type: "select",
    options: "options",
  },
  sfc(rule) {
    rule.type = "elRadioGroup";
    rule.children = (rule.options || []).map((opt) => {
      const option =
        opt && typeof opt === "object"
          ? { value: opt.value ?? opt.label, label: opt.label ?? opt.value }
          : { value: opt, label: opt };
      return {
        type: rule.props?.type === "button" ? "elRadioButton" : "elRadio",
        props: {
          label: option.value,
          value: option.value,
        },
        _sfc: {
          content: option.label,
        },
      };
    });
    delete rule.props.type;
  },
  rule({ t }) {
    return {
      type: name,
      field: `f_${uniqueId8()}`,
      title: t("com.radio.name"),
      info: "",
      $required: false,
      props: { type: "default", distribution: "horizontal" },
      options: makeTreeOptions(
        t("props.option"),
        { label: "label", value: "value" },
        1,
      ),
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      {
        type: "TableOptions",
        field: "formCreateOptions",
        title: t("props.options"),
        _fc_important_prop: true,
        wrap: { show: false },
        props: {
          column: [
            { label: t("props.label"), key: "label" },
            { label: t("props.value"), key: "value" },
          ],
          showHeader: true,
        },
      },
      {
        type: "select",
        field: "type",
        value: "default",
        options: localeOptions(t, [
          { label: "default", value: "default" },
          { label: "button", value: "button" },
        ]),
      },
      {
        type: "select",
        field: "distribution",
        value: "horizontal",
        options: localeOptions(t, [
          { label: "horizontal", value: "horizontal" },
          { label: "vertical", value: "vertical" },
        ]),
      },
      // {type: 'switch', field: 'disabled'}
      // {
      //     type: "CheckBoxInput",
      //     field: "disabled",
      //     wrap: { show: false },
      //   },
      // ,
      // {type: 'switch', field: 'input'}
      // ,
      // {
      //     type: 'switch',
      //     field: 'type',
      //     props: {activeValue: 'button', inactiveValue: 'default'}
      // }, {type: 'ColorInput', field: 'textColor'}, {
      //     type: 'ColorInput',
      //     field: 'fill'
      // }
      //   {
      //     type: "CheckBoxInput",
      //     field: "readonly",
      //     wrap: { show: false },
      //   },
      {
        type: "DefaultValueConfig",
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
