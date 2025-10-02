<template>
    <div class="_fd-itable-form">
        <div class="_fd-itf-wrap" v-if="$slots.default">
            <slot></slot>
        </div>
        <div class="_fc-child-empty" v-else></div>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'InfiniteTableFormView',
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
._fd-itable-form {
    min-height: 130px;
    width: 100%;
    border: 1px solid var(--fc-line-color-3);
    background: var(--fc-bg-color-1);
}

._fd-itable-form ._fc-child-empty {
    min-height: 130px;
}

._fd-itf-wrap {
    display: flex;
    overflow: auto;
}

._fd-itf-wrap > ._fd-drag-tool {
    flex-shrink: 0;
    display: flex;
    margin: 2px;
    height: auto;
}
</style>
