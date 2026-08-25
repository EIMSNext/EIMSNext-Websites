import hidden from "./hidden";
import row from "./row";
import { hasProperty } from "@eimsnext/form-render-core";
import divider from "./divider";
import number, { inputNumber } from "./number";
import select, { fcSelect, select2 } from "./select";
import { tabPane, tableForm } from "./layout";

const getOptions = (ctx) =>
  ctx.payload?.fetch?.options ??
  ctx.payload?.source?.options ??
  ctx.prop?.props?.formCreateInject?.options ??
  ctx.prop?.props?.options ??
  ctx.prop?.options ??
  [];

const checkbox = {
  name: "checkbox",
  toFormValue(value, ctx) {
    const options = getOptions(ctx);
    const values = Array.isArray(value) ? value : [];
    return values.map((item) => {
      const rawValue = item && typeof item === "object" ? item.value : item;
      const option = options.find((candidate) => candidate?.value === rawValue);
      return option
        ? { label: option.label ?? option.text ?? option.value, value: option.value }
        : item;
    });
  },
  mergeProp(ctx) {
    const props = ctx.prop.props;
    if (!hasProperty(props, "options")) props.options = ctx.prop.options || [];
  },
};

const radio = {
  name: "radio",
  toFormValue(value, ctx) {
    const options = getOptions(ctx);
    const rawValue = value && typeof value === "object" ? value.value : value;
    const option = options.find((candidate) => candidate?.value === rawValue);
    return option
      ? { label: option.label ?? option.text ?? option.value, value: option.value }
      : value;
  },
  mergeProp(ctx) {
    const props = ctx.prop.props;
    if (!hasProperty(props, "options")) props.options = ctx.prop.options || [];
  },
};

const cascader = {
  name: "cascader",
  mergeProp(ctx) {
    const props = ctx.prop.props;
    if (!hasProperty(props, "options")) props.options = ctx.prop.options || [];
  },
};

export default [
  hidden,
  row,
  cascader,
  checkbox,
  radio,
  select,
  select2,
  fcSelect,
  number,
  inputNumber,
  divider,
  tabPane,
  tableForm,
];
