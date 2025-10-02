<template>
    <div ref="cell" class="_fd-cell" :class="{'is-new': isNew}" :style="style">
        <div v-bind="$attrs" style="height: 100%;width: 100%;">
            <slot name="default"></slot>
        </div>
    </div>
</template>

<script>
import {defineComponent, nextTick} from 'vue';

export default defineComponent({
    name: 'FcCell',
    inheritAttrs: false,
    data() {
        return {
            isNew: false,
        }
    },
    computed: {
        style() {
            const style = this.$attrs.style || {};
            const css = {
                '--fc-cell-display': style.display || 'block',
                '--fc-cell-flexDirection': style.flexDirection || 'inherit',
                '--fc-cell-flexWrap': style.flexWrap || 'inherit',
                '--fc-cell-alignContent': style.alignContent || 'inherit',
                '--fc-cell-justifyContent': style.justifyContent || 'inherit',
                '--fc-cell-alignItems': style.alignItems || 'inherit',
            }
            if (style.height) {
                css.height = style.height || 'auto';
            }
            if (style.width) {
                css.width = style.width || 'auto';
            }
            return css;
        }
    },
    mounted() {
        this.isNew = this.$el.parentNode.classList.contains('_fd-drag-item');
        if (this.isNew) {
            this.$watch('$attrs.style.width', (n) => {
                nextTick(() => {
                    this.$el.parentNode.style.width = n ? n : '100%';
                })
            }, {
                immediate: true,
            })
        }
    }
});
</script>

<style>
._fd-cell {
    display: inline-block;
}

._fd-cell.is-new {
    width: 100% !important;
}

._fd-cell > div {
    box-sizing: border-box;
}

._fd-cell > div > ._fd-drag-tool > ._fd-drag-box, ._fd-cell > div > ._fd-drag-tool.is-inline {
    display: var(--fc-cell-display) !important;
    flex-direction: var(--fc-cell-flexDirection) !important;
    flex-wrap: var(--fc-cell-flexWrap) !important;
    align-content: var(--fc-cell-alignContent) !important;
    justify-content: var(--fc-cell-justifyContent) !important;
    align-items: var(--fc-cell-alignItems) !important;
}

._fd-cell > div > ._fd-drag-tool > ._fd-drag-box > ._fd-drag-item:has( > ._fd-drag-tool >.el-col-24, >.el-col-24), ._fd-cell > div > ._fd-drag-item:has( > ._fd-drag-tool >.el-col-24, >.el-col-24) {
    flex: none;
}

._fd-cell .el-input-number, ._fd-cell .el-select, ._fd-cell .el-slider, ._fd-cell .el-cascader, ._fd-cell .el-date-editor {
    width: 100%;
}
</style>
