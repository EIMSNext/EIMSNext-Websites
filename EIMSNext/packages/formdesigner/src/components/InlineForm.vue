<template>
    <div class="_fc-line-form">
        <slot></slot>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'fcInlineForm',
});
</script>

<style>
._fc-line-form {
    width: 100%;
    display: flex;
    flex-flow: wrap;
    align-items: flex-start;
}

.form-create-m ._fc-line-form {
    display: flex;
    flex-wrap: wrap;
}

.form-create ._fc-line-form .el-col-24, .form-create ._fc-line-form ._fd-drag-tool, .form-create ._fc-line-form ._fd-drag-item, .form-create ._fc-line-form ._fc-line-form {
    display: inline-flex;
    flex-wrap: wrap;
    max-width: 100%;
    flex: initial;
    width: auto !important;
    flex: unset !important;
}

._fc-m-con .form-create ._fc-line-form > .el-col-24 {
    width: 100% !important;
}

._fc-line-form .el-form-item {
    display: inline-flex;
    vertical-align: middle;
}

._fc-line-form .el-select, ._fc-line-form .el-slider {
    width: 220px;
}
</style>