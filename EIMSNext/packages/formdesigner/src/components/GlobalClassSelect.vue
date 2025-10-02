<template>
    <div class="_fd-gcs">
        <el-select v-model="value"
                   multiple
                   filterable
                   allow-create
                   default-first-option
                   :reserve-keyword="false"
                   clearable @change="input">
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
        </el-select>
        <div class="_fd-gcs-handle">
            <div class="_fc-manage-text" @click="openConfig"><i
                class="fc-icon icon-setting"/></div>
        </div>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'GlobalClassSelect',
    emits: ['update:modelValue'],
    props: {
        modelValue: [Array, String],
        to: String,
    },
    inject: ['designer'],
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        options() {
            return Object.keys((this.designer.setupState.formOptions.globalClass || {})).map(k => {
                return {label: this.designer.setupState.formOptions.globalClass[k].label, value: k}
            })
        },
    },
    watch: {
        modelValue() {
            this.tidyValue();
        },
    },
    data() {
        return {
            value: [],
        };
    },
    methods: {
        tidyValue() {
            this.value = Array.isArray(this.modelValue) ? this.modelValue : (this.modelValue || '').split(' ').filter(v => !!v);
        },
        openConfig() {
            this.designer.setupState.openGlobalClassDialog();
        },
        input() {
            this.$emit('update:modelValue', this.value.join(' '));
        },
    },
    created() {
        this.tidyValue();
    }
});
</script>

<style>
._fd-gcs {
    display: flex;
    align-items: center;
    width: 100%;
}

._fd-gcs .el-select {
    width: 190px;
}

._fd-gcs-handle {
    display: inline-flex;
    height: 14px;
    line-height: 14px;
}

._fd-gcs-handle ._fc-manage-text {
    border-left: 1px solid var(--fc-line-color-3);
    padding-left: 4px;
}
</style>