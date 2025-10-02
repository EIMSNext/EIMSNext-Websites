<template>
    <el-radio-group :modelValue="modelValue" class="_fd-span-input">
        <el-radio-button :value="item.value" :label="item.value" v-for="item in layout" :key="item.value"
                         @click="onInput(item.value)">
            {{ item.value === 24 ? t('form.row') : item.label }}
        </el-radio-button>
    </el-radio-group>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'SpanInput',
    props: {
        modelValue: [Number, String],
    },
    inject: ['designer'],
    computed: {
        t() {
            return this.designer.setupState.t;
        },
    },
    data() {
        return {
            layout: [
                {label: '1/4', value: 6},
                {label: '1/3', value: 8},
                {label: '1/2', value: 12},
                {label: '2/3', value: 16},
                {label: '3/4', value: 18},
                {label: '整行', value: 24},
            ]
        }
    },
    methods: {
        onInput(span) {
            this.$emit('update:modelValue', span === this.modelValue ? '' : span);
        }
    }

});
</script>

<style>
._fd-span-input {
    width: 100%;
}

._fd-span-input .el-radio-button__inner {
    width: 100%;
    padding: 4px;
    line-height: 16px;
}

._fd-span-input .el-radio-button {
    flex: 1;
}
</style>
