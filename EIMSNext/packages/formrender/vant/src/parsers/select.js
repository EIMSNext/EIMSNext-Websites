import { hasProperty, toArray } from "@eimsnext/form-render-core";

const optionValue = (value) =>
  value && typeof value === "object" ? value.value : value;

const normalizeOptionValue = (value, options) => {
  const rawValue = optionValue(value);
  const option = (options || []).find((item) => item?.value === rawValue);
  if (option) {
    return { value: option.value, label: option.label ?? option.text ?? option.value };
  }
  if (value && typeof value === "object") {
    return {
      value: value.value,
      label: value.label ?? value.text ?? value.value,
    };
  }
  return value;
};

const getOptions = (ctx) =>
  ctx.payload?.fetch?.options ??
  ctx.payload?.source?.options ??
  ctx.prop.options ??
  [];

const createSelectParser = (name, multiple = false) => ({
  name,
  toFormValue(value, ctx) {
    const options = getOptions(ctx);
    if (multiple || ctx.prop.props.multiple) {
      const values = value === undefined || value === null || value === ""
        ? []
        : Array.isArray(value)
          ? value
          : toArray(value);
      const result = [];
      const seen = new Set();
      values.map((item) => normalizeOptionValue(item, options)).forEach((item) => {
        const rawValue = optionValue(item);
        if (!seen.has(rawValue)) {
          seen.add(rawValue);
          result.push(item);
        }
      });
      return result;
    }
    return normalizeOptionValue(value, options);
  },
  mergeProp(ctx) {
    const props = ctx.prop.props;
    if (!hasProperty(props, "options")) props.options = ctx.prop.options || [];
    if (multiple) props.multiple = true;
  },
});

export const select = createSelectParser("select");
export const select2 = createSelectParser("select2", true);
export const fcSelect = createSelectParser("fcSelect");

export default select;
