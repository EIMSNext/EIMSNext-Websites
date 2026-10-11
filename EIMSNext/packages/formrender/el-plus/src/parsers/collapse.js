import { uniqueId8 } from '@eimsnext/form-render-core';

const name = 'collapse';

// 设计态规则可能被 DragTool/DragBox 包裹，先剥一层拿到真正的面板（同 tabs 处理）。
const unwrapPane = (child) => {
    if (
        child &&
        (child.type === 'DragTool' || child.type === 'DragBox') &&
        Array.isArray(child.children)
    ) {
        return unwrapPane(child.children[0]);
    }
    return child;
};

// modelValue 指向不存在的面板时兜底到第一个面板（空值/空数组是合法的"全部收起"态，保持不动）。
const normalizeActiveNames = (rule) => {
    const props = rule.props || (rule.props = {});
    const children = Array.isArray(rule.children) ? rule.children : [];
    const names = [];
    children.forEach((item) => {
        const pane = unwrapPane(item);
        if (!pane) {
            return;
        }
        const paneProps = pane.props || (pane.props = {});
        if (!paneProps.name || names.indexOf(paneProps.name) > -1) {
            paneProps.name = uniqueId8();
        }
        names.push(paneProps.name);
    });
    if (!names.length) {
        return;
    }
    const val = props.modelValue;
    if (props.accordion) {
        if (val === undefined || val === null || (typeof val === 'string' && val && names.indexOf(val) < 0)) {
            props.modelValue = names[0];
        }
    } else if (val === undefined || val === null) {
        props.modelValue = [names[0]];
    } else if (Array.isArray(val)) {
        // 含已删除面板的 name 才清理；有效值原样放行，避免每次渲染写回触发更新循环。
        if (val.some((n) => names.indexOf(n) < 0)) {
            props.modelValue = val.filter((n) => names.indexOf(n) > -1);
        }
    } else if (typeof val === 'string' && val && names.indexOf(val) < 0) {
        props.modelValue = [names[0]];
    }
};

export default {
    name,
    mergeProp(ctx) {
        const props = ctx.prop.props || {};
        // expandIconPosition 是 el-collapse 原生 prop，未设置时默认图标在左
        if (props.expandIconPosition !== 'left' && props.expandIconPosition !== 'right') {
            props.expandIconPosition = 'left';
        }
        ctx.prop.props = props;
        ctx.prop.class = [ctx.prop.class, 'fc-collapse-enhanced'].filter(Boolean);
        normalizeActiveNames(ctx.prop);
    },
};
