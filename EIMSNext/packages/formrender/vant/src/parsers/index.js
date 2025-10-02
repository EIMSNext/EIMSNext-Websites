import hidden from "./hidden";
import row from "./row";
import { hasProperty } from "@eimsnext/form-render-core";

const checkbox = {
  name: "checkbox",
  mergeProp(ctx) {
    const props = ctx.prop.props;
    if (!hasProperty(props, "options")) props.options = ctx.prop.options || [];
  },
};

const radio = {
  name: "radio",
  mergeProp(ctx) {
    const props = ctx.prop.props;
    if (!hasProperty(props, "options")) props.options = ctx.prop.options || [];
  },
};

const select = {
  name: "select",
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

export default [hidden, row, cascader, checkbox, radio, select];
