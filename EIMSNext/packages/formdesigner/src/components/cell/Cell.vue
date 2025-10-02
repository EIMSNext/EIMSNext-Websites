<template>
    <div ref="cell" class="_fc-cell">
        <slot name="default"></slot>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'FcCell',
});
</script>

<style>
._fc-cell {
    display: inline-block;
}

._fc-cell .el-input-number, ._fc-cell .el-select, ._fc-cell .el-slider, ._fc-cell .el-cascader, ._fc-cell .el-date-editor {
    width: 100%;
}
</style>
