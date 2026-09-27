import { deepCopy } from "@eimsnext/form-render-core";

export const tabPane = {
  name: "elTabPane",
  mergeProp(ctx) {
    const props = ctx.prop.props;
    props.title = props.title || props.label;
    props.lazyRender = props.lazyRender ?? props.lazy;
    delete props.label;
    delete props.lazy;
  },
};

export const tableForm = {
  name: "tableform",
  mergeProp(ctx) {
    const props = ctx.prop.props;
    const columns = Array.isArray(props.columns) ? props.columns : [];
    props.rule = columns.flatMap((column) =>
      (column.rule || []).map((sourceRule) => {
        const rule = deepCopy(sourceRule);
        if (!rule.title && column.label) rule.title = column.label;
        return rule;
      }),
    );
    props.options = props.options || { submitBtn: false, resetBtn: false };
    props.button = props.addable !== false || props.deletable !== false;
    delete props.columns;
    delete props.page;
    delete props.showIndex;
    delete props.filterEmptyColumn;
    delete props.newColumn;
  },
};
