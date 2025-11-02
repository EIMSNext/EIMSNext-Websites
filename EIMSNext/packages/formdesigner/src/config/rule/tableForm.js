import { uniqueId } from "@eimsnext/form-render-core";
import { localeOptions, localeProps } from "../../utils";

const label = "子表单";
const name = "tableform";

export default {
  menu: "subform",
  icon: "icon-table-form",
  label,
  name,
  input: true,
  mask: false,
  subForm: "array",
  languageKey: ["add", "delete", "operation", "dataEmpty"],
  event: ["change", "add", "delete", "handleClick"],
  children: "tableFormColumn",
  subRender({ t, h, resolveComponent, subRule }) {
    return [
      {
        label: t("props.title"),
        vnode: h(resolveComponent("el-input"), {
          size: "small",
          modelValue: subRule.props.label,
          "onUpdate:modelValue": (v) => {
            subRule.props.label = v;
          },
        }),
      },
    ];
  },
  loadRule(rule) {
    if (!rule.props) rule.props = {};
    const columns = rule.props.columns || [];
    rule.children = columns.map((column) => {
      return {
        type: "tableFormColumn",
        _fc_drag_tag: "tableFormColumn",
        props: {
          header: column.header,
          label: column.label,
          fixed: column.fixed,
          required: column.required || false,
          hidden: column.hidden || false,
          width: column.style.width || "",
          color: column.style.color || "",
        },
        children: column.rule || [],
      };
    });
    delete rule.props.columns;
  },
  parseRule(rule) {
    const children = rule.children || [];
    rule.props.columns = children.map((column) => {
      return {
        header: column.props.header,
        label: column.props.label,
        fixed: column.props.fixed,
        required: column.props.required,
        hidden: column.props.hidden,
        style: {
          width: column.props.width,
          color: column.props.color,
        },
        rule: column.children || [],
      };
    });
    rule.children = [];
  },
  sfc: false,
  rule({ t }) {
    return {
      type: "tableform",
      field: uniqueId(),
      title: t("com.tableform.name"),
      info: "",
      props: {
        button: {
          open: true,
          column: [
            {
              key: "delete",
              name: "删除",
              type: "danger",
              size: "small",
              prop: ["link"],
            },
          ],
        },
      },
      children: [],
    };
  },
  props(_, { t }) {
    const propsT = function (list) {
      return localeProps(t, name + ".props", list);
    };
    return localeProps(t, name + ".props", [
      {
        type: "ConfigItem",
        props: {
          label: t("com.dataTable.props.button"),
        },
        col: {
          show: true,
        },
        children: [
          {
            type: "HideConfig",
            title: t("com.dataTable.props.button"),
            wrap: { show: false },
            col: { show: false },
            field: "button>open",
          },
          {
            type: "template",
            slot: "append",
            children: propsT([
              {
                type: "TableButtonConfig",
                col: { show: false },
                field: "button>column",
              },
              {
                type: "input",
                col: { show: false },
                field: "button>label",
                value: "操作",
              },
              {
                type: "select",
                col: { show: false },
                field: "button>fixed",
                options: [
                  { label: t("com.dataTable.fixed.default"), value: false },
                  { label: t("com.dataTable.fixed.left"), value: "left" },
                  { label: t("com.dataTable.fixed.right"), value: "right" },
                ],
                value: "right",
              },
              {
                type: "SizeInput",
                col: { show: false },
                field: "button>width",
                value: "100px",
              },
            ]),
          },
        ],
      },
      {
        type: "ConfigItem",
        props: {
          label: t("com.dataTable.props.page"),
        },
        col: {
          show: true,
        },
        children: [
          {
            type: "HideConfig",
            wrap: {
              show: false,
            },
            col: {
              show: false,
            },
            title: t("com.dataTable.props.page"),
            field: "page>open",
          },
          {
            type: "template",
            slot: "append",
            children: propsT([
              {
                type: "inputNumber",
                col: {
                  show: false,
                },
                field: "page>props>pageSize",
                value: 20,
              },
              {
                type: "switch",
                col: {
                  show: false,
                },
                field: "page>props>small",
              },
              {
                type: "switch",
                col: {
                  show: false,
                },
                field: "page>props>background",
              },
            ]),
          },
        ],
      },
      {
        type: "switch",
        field: "disabled",
      },
      {
        type: "select",
        field: "size",
        options: localeOptions(t, [
          { label: "large", value: "large" },
          { label: "default", value: "default" },
          { label: "small", value: "small" },
        ]),
      },
      {
        type: "input",
        field: "emptyText",
      },
      {
        type: "switch",
        field: "stripe",
      },
      {
        type: "switch",
        field: "border",
      },
      {
        type: "switch",
        field: "showIndex",
      },
      {
        type: "switch",
        field: "addable",
        value: true,
      },
      {
        type: "switch",
        field: "deletable",
        value: true,
      },
      {
        type: "switch",
        field: "newColumn",
      },
      {
        type: "switch",
        field: "filterEmptyColumn",
        value: true,
      },
      {
        type: "SizeInput",
        field: "height",
      },
      {
        type: "inputNumber",
        field: "max",
        props: { min: 0 },
      },
    ]);
  },
};
