<template>
    <div class="_fd-cdi-input">
        <template v-if="type === 'cascader'">
            <el-cascader size="default" :props="{checkStrictly: true, emitPath: false}" v-bind="props || {}"
                         :options="options"
                         v-model="value"
                         @change="onInput"></el-cascader>
        </template>
        <template v-else-if="type === 'number'">
            <el-input-number size="default" v-bind="props || {}" v-model="value" @change="onInput"></el-input-number>
        </template>
        <template v-else-if="type === 'select'">
            <el-select size="default"
                       filterable
                       allow-create
                       default-first-option v-bind="props || {}" v-model="value" @change="onInput">
                <el-option v-for="opt in options" :label="opt.label" :value="opt.value" :key="opt.value"></el-option>
            </el-select>
        </template>
        <template v-else-if="type === 'switch'">
            <el-switch size="default" v-bind="props || {}" v-model="value" @change="onInput">
            </el-switch>
        </template>
        <template v-else>
            <el-input size="default" v-bind="props || {}" v-model="value" @blur="onInput"></el-input>
        </template>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'ConditionInput',
    inject: ['designer'],
    emits: ['update:modelValue', 'change'],
    props: {
        type: String,
        options: Array,
        props: Object,
        modelValue: [String, Number, Array, Object, Boolean]
    },
    watch: {
        modelValue() {
            this.value = this.modelValue || undefined;
        },
    },
    data() {
        return {
            value: this.modelValue || undefined,
        }
    },
    methods: {
        onInput() {
            this.$emit('update:modelValue', this.value);
            this.$emit('change', this.value);
        },
    },
    created() {
    }

});
</script>

<style>
._fd-cdi-input > div {
    width: 100%;
}
</style>
