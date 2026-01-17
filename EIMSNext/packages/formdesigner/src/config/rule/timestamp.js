import { uniqueId } from "@eimsnext/form-render-core";
import { localeOptions, localeProps } from "../../utils";

const label = "日期";
const name = "timestamp";

// export const DEFAULT_FORMATS = {
//   date: "YYYY-MM-DD",
//   month: "YYYY-MM",
//   datetime: "YYYY-MM-DD HH:mm:ss",
//   timerange: "HH:mm:ss",
//   daterange: "YYYY-MM-DD",
//   monthrange: "YYYY-MM",
//   datetimerange: "YYYY-MM-DD HH:mm:ss",
//   year: "YYYY",
// };

export default {
  menu: "main",
  icon: "icon-date",
  label,
  name,
  input: true,
  event: [
    "change",
    "blur",
    "focus",
    "calendarChange",
    "panelChange",
    "visibleChange",
  ],
  sfc(rule) {
    // if (!rule.props.valueFormat) {
    //   rule.props.valueFormat =
    //     DEFAULT_FORMATS[rule.props.type] || DEFAULT_FORMATS["date"];
    // }
  },
  rule({ t }) {
    return {
      type: name,
      field: uniqueId(),
      title: t("com.timestamp.name"),
      info: "",
      $required: false,
      props: {
        valueFormat: "x",
        type: "date",
        format: "YYYY-MM-DD",
        clearable: true,
      },
    };
  },
  watch: {
    format({ value, rule }) {
      rule.props.type = value.indexOf("H") > -1 ? "datetime" : "date";
    },
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      {
        type: "input",
        field: "placeholder",
      },
      // { type: "switch", field: "readonly" },
      // {
      //   type: "CheckBoxInput",
      //   field: "readonly",
      //   wrap: { show: false },
      // },
      // {
      //   type: "switch",
      //   field: "disabled",
      // },
      // {
      //   type: "CheckBoxInput",
      //   field: "disabled",
      //   wrap: { show: false },
      // },
      {
        type: "select",
        field: "format",
        options: localeOptions(t, [
          { label: "YYYY-MM", value: "YYYY-MM" },
          { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
          { label: "YYYY-MM-DD HH:mm", value: "YYYY-MM-DD HH:mm" },
          { label: "YYYY-MM-DD HH:mm:ss", value: "YYYY-MM-DD HH:mm:ss" },
          // { label: "date", value: "date" },
          //{label: 'dates', value: 'dates'},
          // {label: 'week', value: 'week'},
          // { label: "datetime", value: "datetime" },
          // { label: "datetimerange", value: "datetimerange" },
          // { label: "daterange", value: "daterange" },
          //, {label: 'monthrange', value: 'monthrange'}
        ]),
      },
      {
        type: "DefaultValueConfig",
      },
      //  {
      //     type: 'switch',
      //     field: 'clearable',
      //     value: true
      // },
      // {
      //     type: 'Struct',
      //     field: 'pickerOptions',
      //     props: {defaultValue: {}}
      // },
      // { type: "switch", field: "editable", value: true },
      // {
      //   type: "CheckBoxInput",
      //   field: "editable",
      //   value: true,
      //   wrap: { show: false },
      // },
      // {
      //   type: "input",
      //   field: "startPlaceholder",
      // },
      // { type: "input", field: "endPlaceholder" },
      // {
      //   type: "input",
      //   field: "format",
      // },
      // , {
      //     type: 'select',
      //     field: 'align',
      //     options: localeOptions(t, [{label: 'left', value: 'left'}, {label: 'center', value: 'center'}, {
      //         label: 'right',
      //         value: 'right'
      //     }])
      // },
      // {type: 'input', field: 'rangeSeparator'},
      //  {
      //     type: 'switch',
      //     field: 'unlinkPanels'
      // }
      // {
      //   type: "CheckBoxInput",
      //   field: "readonly",
      //   wrap: { show: false },
      // },
      {
        type: "CheckBoxInput",
        field: "disabled",
        wrap: { show: false },
      },
    ]);
  },
};
