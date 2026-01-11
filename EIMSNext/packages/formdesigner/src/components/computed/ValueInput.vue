<template>
    <el-input class="_fd-value-input" v-model="value" @blur="onBlur" v-bind="$attrs">
        <template #append v-if="$slots.append">
            <slot name="append"></slot>
        </template>
    </el-input>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'ValueInput',
    emits: ['update:modelValue', 'change', 'blur'],
    inject: ['designer'],
    props: {
        modelValue: [String],
    },
    data() {
        return {
            value: '',
        }
    },
    computed: {
        t() {
            return this.designer.setupState.t;
        }
    },
    watch: {
        modelValue: {
            handler: function (val) {
                this.value = null == val ? '' : ('' + val);
            },
            immediate: true,
        }
    },
    methods: {
        onBlur(...args) {
            if (this.value !== this.toValue(this.modelValue)) {
                this.updateValue(this.value);
            }
            this.$emit('blur', ...args);
        },
        updateValue(val) {
            const value = this.toValue(val);
            this.$emit('update:modelValue', value);
            this.$emit('change', value);
        },
        toValue(val) {
            return '' + val;
        }
    }
});
</script>

<style>
._fd-value-input .el-input__validateIcon {
    display: none;
}

._fd-value-input .el-select, ._fd-value-input .el-select__wrapper {
    height: 100%;
}
</style>
