<template>
    <div class="_fd-ntable-form">
        <div class="_fd-ntf-wrap" v-if="$slots.default">
            <slot></slot>
        </div>
        <div class="_fc-child-empty" v-else></div>
        <template v-if="$slots.default">
            <div class="_fd-ntable-sub">
                <div class="_title">
                    {{ t('com.nestedSubTableForm.name') }}
                </div>
                <slot name="nested"></slot>
            </div>
        </template>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'NestedTableFormView',
    inject: ['designer'],
    data() {
        return {};
    },
    computed: {
        t() {
            return this.designer.setupState.t;
        },
    },
});
</script>

<style>
._fd-ntable-form {
    min-height: 130px;
    width: 100%;
    border: 1px solid var(--fc-line-color-3);
    background: var(--fc-bg-color-1);
}

._fd-ntable-sub .el-form-item__label,._fd-ntable-sub .van-field__label {
    display: none;
}

._fd-ntable-form ._fc-child-empty {
    min-height: 130px;
}

._fd-ntf-wrap {
    display: flex;
    overflow: auto;
}

._fd-ntf-wrap > ._fd-drag-tool {
    flex-shrink: 0;
    display: flex;
    margin: 2px;
    height: auto;
}

._fd-ntable-sub ._title {
    display: inline-block;
    padding: 6px 8px 0;
    background-color: var(--fc-bg-color-3);
    border-radius: 8px 8px 0 0;
    margin-left: 2px;
    height: 20px;
    line-height: 1em;
    font-size: 12px;
    text-align: center;
    color: #65676b;
}

._fd-ntable-sub > ._fd-drag-tool{
    margin-top: 0;
}
</style>
