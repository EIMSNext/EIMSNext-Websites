<template>
    <div class="_fd-gfs">
        <el-select v-model="value" clearable filterable @change="input">
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
        </el-select>
        <div class="_fd-gfs-handle">
            <i @click="refresh" class="fc-icon icon-refresh" :class="{disabled: !value, '_fc-loading': this.loading}"
               title="reload"/>
            <div class="_fc-manage-text" @click="openConfig"><i
                class="fc-icon icon-setting"/></div>
        </div>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'GlobalFetchSelect',
    emits: ['update:modelValue'],
    props: {
        modelValue: [Object, String],
        to: String,
    },
    inject: ['designer'],
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        options() {
            return Object.keys((this.designer.setupState.formOptions.globalData || {})).map(k => {
                return {label: this.designer.setupState.formOptions.globalData[k].label, value: k}
            })
        },
    },
    watch: {
        modelValue() {
            this.value = (this.modelValue || {}).key || '';
        },
    },
    data() {
        return {
            value: (this.modelValue || {}).key || '',
            uni: 1,
            loading: false,
        };
    },
    methods: {
        refresh() {
            if (!this.value) {
                return;
            }
            this.uni = this.uni === 1 ? 0 : 1;
            this.input();
            this.loading = true;
            setTimeout(() => {
                this.loading = false;
            }, 1000);
        },
        openConfig() {
            this.designer.setupState.openGlobalFetchDialog();
        },
        input() {
            const value = typeof this.modelValue === 'object' ? {...this.modelValue} : {};
            value.to = this.to || 'options';
            value.key = this.value;
            value._uni = this.uni;
            this.$emit('update:modelValue', value);
        },
    }
});
</script>

<style>
._fd-gfs {
    display: flex;
    align-items: center;
    width: 100%;
}

._fd-gfs .el-select {
    width: 190px;
}

._fd-gfs-handle {
    display: inline-flex;
    height: 14px;
    line-height: 14px;
}

._fd-gfs-handle .fc-icon {
    cursor: pointer;
    margin-left: 4px;
    color: var(--fc-style-color-1);
}

._fd-gfs-handle .icon-refresh.disabled {
    color: #a9abb2;
    cursor: not-allowed;
}

._fd-gfs-handle ._fc-manage-text {
    border-left: 1px solid var(--fc-line-color-3);
    padding-left: 4px;
}
</style>