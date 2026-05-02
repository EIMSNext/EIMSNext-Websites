<template>
    <div class="_fd-table-form">
        <div class="_fd-tf-wrap" v-if="$slots.default">
            <slot></slot>
        </div>
        <div class="_fc-child-empty" v-else></div>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'TableFormView',
    data() {
        return {};
    },
});
</script>

<style>
._fd-table-form {
    min-height: 130px;
    width: 100%;
    border: 1px solid var(--fc-line-color-3);
    background: var(--fc-bg-color-1);
}

._fc-child-empty {
    min-height: 130px;
}

._fd-tf-wrap {
    display: flex;
    overflow: auto;
    min-height: 130px;
    padding: 2px;
    box-sizing: border-box;
}

._fd-tf-wrap > ._fd-tableform-drag {
    display: inline-flex;
    align-items: stretch;
    align-content: flex-start;
    flex-wrap: nowrap !important;
    min-width: 100%;
    min-height: 126px;
    width: max-content;
}

._fd-tf-wrap > ._fd-tableform-drag.drag-holder {
    position: relative;
    min-width: 100%;
    min-height: 126px;
    width: 100%;
}

._fd-tf-wrap > ._fd-tableform-drag.drag-holder::after {
    inset: 0;
}

._fd-tf-wrap > ._fd-tableform-drag > ._fd-drag-item {
    width: auto;
    flex: 0 0 auto;
    max-width: none;
    padding-left: 2px;
    padding-right: 2px;
}

._fd-tf-wrap > ._fd-tableform-drag > ._fd-drag-item:has( > ._fd-drag-tool > .el-col, > .el-col) {
    flex: 0 0 auto;
    max-width: none;
}

._fd-tf-wrap > ._fd-tableform-drag > ._fd-drag-item > ._fd-drag-tool > .el-col,
._fd-tf-wrap > ._fd-tableform-drag > ._fd-drag-item > .el-col {
    flex: 0 0 auto;
    max-width: none;
}

._fd-tf-wrap > ._fd-drag-tool {
    flex-shrink: 0;
    display: flex;
    margin: 2px;
    height: auto;
}

._fd-tf-wrap._fd-drop-hover {
    outline: 1px dashed var(--fc-style-color-1);
    background: var(--fc-style-bg-color-1);
}

._fd-tf-wrap .ghost {
    opacity: 0.55;
}

</style>
