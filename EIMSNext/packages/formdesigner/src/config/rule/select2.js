import { uniqueId } from "@eimsnext/form-render-core";
import {
  getInjectArg,
  localeProps,
  makeOptionsRule,
  makeTreeOptions,
} from "../../utils/index";

const label = "选择器";
const name = "select2";

export default {
  menu: "main",
  icon: "icon-select",
  label,
  name,
  input: true,
  event: ["change", "visibleChange", "removeTag", "clear", "blur", "focus"],
  validate: ["array"],
  condition: {
    type: "select",
    options: "options",
  },
  sfc(rule) {
    rule.type = "elSelect";
    rule.children = (rule.options || []).map((opt) => {
      return {
        type: "elOption",
        props: {
          label: opt.label,
          value: opt.value,
        },
      };
    });
  },
  rule({ t }) {
    return {
      type: name,
      field: uniqueId(),
      title: t("com.select2.name"),
      info: "",
      effect: {
        fetch: "",
      },
      $required: false,
      props: { multiple: true, clearable: true,filterable:true },
      options: makeTreeOptions(
        t("props.option"),
        { label: "label", value: "value" },
        1
      ),
    };
  },
  // watch: {
  //     multiple({rule}) {
  //         rule.key = uniqueId();
  //     }
  // },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      { type: "input", field: "placeholder" },
      makeOptionsRule(t, "options"),
      //   { type: "switch", field: "multiple" },
      // {
      //   type: "switch",
      //   field: "disabled",
      // },
      // {
      //   type: "CheckBoxInput",
      //   field: "disabled",
      //   wrap: { show: false },
      // },
      // { type: "switch", field: "clearable" },
      // {
      //   type: "CheckBoxInput",
      //   field: "clearable",
      //   wrap: { show: false },
      // },
      // {
      //     type: 'switch',
      //     field: 'collapseTags'
      // },
      // {
      //     type: 'inputNumber',
      //     field: 'multipleLimit',
      //     props: {min: 0}
      // },
      // {
      //   type: "switch",
      //   field: "filterable",
      // },
      {
        type: "DefaultValueConfig",
      },
      // {
      //   type: "CheckBoxInput",
      //   field: "filterable",
      //   wrap: { show: false },
      // },
      // {
      //     type: 'switch',
      //     field: 'remote',
      // }, {
      //     type: 'FnInput',
      //     field: 'remoteMethod',
      //     props: {
      //         body: true,
      //         button: true,
      //         fnx: true,
      //         name: 'remoteMethod',
      //         args: [getInjectArg(t)],
      //     },
      // },
      //  {type: 'switch', field: 'allowCreate'},
      // {
      //   type: "input",
      //   field: "noMatchText",
      // },
      // {type: 'input', field: 'noDataText'}, {
      //     type: 'switch',
      //     field: 'reserveKeyword'
      // },
      // { type: "switch", field: "defaultFirstOption" },
      // {
      //   type: "CheckBoxInput",
      //   field: "readonly",
      //   wrap: { show: false },
      // },
      { type: "GroupLabel", props: { title: t("props.othersetting") } },
      {
        type: "CheckBoxInput",
        field: "disabled",
        wrap: { show: false },
      },
    ]);
  },
};
