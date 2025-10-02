<template>
    <div ref="cell" class="_fc-cell">
        <slot name="default"></slot>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'FcCell',
    // inject: ['designer'],
    // mounted() {
    //     if (this.designer) {
    //         this.$nextTick(() => {
    //             this.$refs.cell.parentElement.style.display = 'contents';
    //         });
    //     }
    // },
    // beforeUnmount() {
    //     if (this.designer) {
    //         const parent = this.$refs.cell.parentElement;
    //         this.$nextTick(() => {
    //             if(!Array.from(parent.children).filter(child => child.classList.contains('_fc-cell')).length) {
    //                 parent.style.display = 'inherit';
    //             }
    //         });
    //     }
    // }
});
</script>

<style>
._fc-cell {
    display: inline-block;
    width: 50%;
}

._fc-cell .el-input-number, ._fc-cell .el-select, ._fc-cell .el-slider, ._fc-cell .el-cascader, ._fc-cell .el-date-editor {
    width: 100%;
}
</style>
