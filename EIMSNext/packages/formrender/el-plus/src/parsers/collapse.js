const name = 'collapse';

export default {
    name,
    mergeProp(ctx) {
        const props = ctx.prop.props || {};
        // expandIconPosition 是 el-collapse 原生 prop，未设置时默认图标在左
        if (props.expandIconPosition !== 'left' && props.expandIconPosition !== 'right') {
            props.expandIconPosition = 'left';
        }
        ctx.prop.props = props;
    },
};
