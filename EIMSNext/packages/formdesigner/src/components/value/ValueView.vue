<template>
    <div class="_fd-value">
        {{t('com.fcValue.empty')}}
    </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'FcValue',
    props: ['modelValue'],
    inject: ['designer'],
    watch: {
        modelValue(n) {
            this.$emit('change', n);
        },
    },
    computed: {
        t() {
            return this.designer.setupState.t
        },
    }
});
</script>

<style>
._fd-value {
    color: var(--fc-text-color-3);
    white-space: nowrap;
}
</style>

