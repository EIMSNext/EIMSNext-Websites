import { uniqueId8 } from "@eimsnext/form-render-core";
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
  drag: true,
  denyDrag: {
    item: ["tableform", "divider", "fcRow", "col", "fcFlex", "fcFlex2", "fcCell", "tabs", "elTabPane", "collapse", "elCollapseItem", "fcTable", "elCard", "fcInlineForm"],
    menu: ["layout"],
  },
  subRender() {
    return [];
  },
  loadRule(rule) {
    if (!rule.props) rule.props = {};
    delete rule.props.button;
    delete rule.props.page;
    rule.props.max = 200;
    rule.props.stripe = true;
    rule.props.border = true;
    rule.props.showIndex = true;
    const columns = rule.props.columns || [];
    const unwrapColumnRule = (item) => {
      let current = item;
      while (current && current.type === "DragTool" && Array.isArray(current.children) && current.children[0]) {
        current = current.children[0];
      }
      if (current && current.type === "DragBox") {
        const child = Array.isArray(current.children) ? current.children[0] : null;
        return child ? unwrapColumnRule(child) : null;
      }
      if (!current) {
        return null;
      }
      delete current.wrap;
      delete current.col;
      if (current.native == null) {
        current.native = true;
      }
      return current;
    };
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
        children: (column.rule || []).map(unwrapColumnRule).filter(Boolean),
      };
    });
    delete rule.props.columns;
  },
  parseRule(rule) {
    const children = rule.children || [];
    delete rule.props.button;
    delete rule.props.page;
    rule.props.max = 200;
    rule.props.stripe = true;
    rule.props.border = true;
    rule.props.showIndex = true;
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
      field: `f_${uniqueId8()}`,
      title: t("com.tableform.name"),
      info: "",
      props: {
        max: 200,
        stripe: true,
        border: true,
        showIndex: true,
        editable: true,
        editExisting: true,
        addable: true,
        insertable: true,
        deletable: true,
      },
      children: [],
    };
  },
  props(_, { t }) {
    const propsT = function (list) {
      return localeProps(t, name + ".props", list);
    };
    return localeProps(t, name + ".props", [
      // {
      //   type: "select",
      //   field: "size",
      //   options: localeOptions(t, [
      //     { label: "large", value: "large" },
      //     { label: "default", value: "default" },
      //     { label: "small", value: "small" },
      //   ]),
      // },
      // {
      //   type: "input",
      //   field: "emptyText",
      // },
      { type: "GroupLabel", props: { title: t("form.operationPermission") } },
      {
        type: "CheckBoxInput",
        field: "stripe",
        hidden: true,
        value: true,
        wrap: { show: false },
      },
      {
        type: "CheckBoxInput",
        field: "border",
        hidden: true,
        value: true,
        wrap: { show: false },
      },
      {
        type: "CheckBoxInput",
        field: "showIndex",
        hidden: true,
        value: true,
        wrap: { show: false },
      },
      {
        type: "CheckBoxInput",
        field: "_hidden",
        props: { title: t("props.hide") },
        wrap: { show: false },
      },
      {
        type: "CheckBoxInput",
        field: "editable",
        props: { title: t("comp.formFieldPermissions.edit") },
        value: true,
        wrap: { show: false },
      },
      {
        type: "ConfigItem",
        props: { label: t("comp.formFieldPermissions.edit") },
        children: propsT([
          { type: "CheckBoxInput", field: "addable", props: { title: t("comp.formFieldPermissions.addRecord") }, wrap: { show: false } },
          { type: "CheckBoxInput", field: "insertable", props: { title: t("form.insertRecord") }, wrap: { show: false } },
          { type: "CheckBoxInput", field: "editExisting", props: { title: t("comp.formFieldPermissions.editRecord") }, wrap: { show: false } },
          { type: "CheckBoxInput", field: "deletable", props: { title: t("comp.formFieldPermissions.deleteRecord") }, wrap: { show: false } },
        ]),
      },
    ]);
  },
};
