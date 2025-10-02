<template>
    <el-dialog class="_fc-dialog" v-bind="$attrs" :fullscreen="max" v-model="visible" destroyOnClose>
        <button class="el-dialog__headerbtn" type="button" style="right: 48px;" v-if="!$attrs.fullscreen">
            <i class="fc-icon icon-page-min" v-if="max" @click="max=false"></i>
            <i class="fc-icon icon-page-max" v-else @click="max=true"></i>
        </button>
        <component :is="Form" :option="options" :rule="formRule" :extendOption="true"
                   v-model:api="fapi"
                   :model-value="value"
                   :subForm="false"
                   @change="formChange"
                   @emit-event="$emit"></component>
        <template #footer v-if="footer !== false">
            <el-button @click="close">{{formCreateInject.t('close') || '关闭'}}</el-button>
            <el-button type="primary" @click="handleConfirm">{{formCreateInject.t('ok') || '确定'}}</el-button>
        </template>
    </el-dialog>
</template>

<script>
import { deepCopy } from '@eimsnext/form-render-core';
import {defineComponent, markRaw, onUnmounted, reactive} from 'vue';

export default defineComponent({
    name: 'FcDialog',
    emits: ['confirm', 'submit', 'validateFail', 'update:modelValue'],
    props: {
        formData: Object,
        options: {
            type: Object,
            default: () => reactive(({
                submitBtn: false,
                resetBtn: false,
            }))
        },
        rule: Array,
        autoClose: {
            type: Boolean,
            default: true
        },
        footer: {
            type: Boolean,
            default: true
        },
        modelValue: Object,
        formCreateInject: Object,
    },
    data() {
        return {
            visible: false,
            max: this.$attrs.fullscreen || false,
            fapi: {},
            value: {},
            formRule: [],
            Form: markRaw(this.formCreateInject.form.$form()),
        }
    },
    methods: {
        formChange() {
            this.$emit('update:modelValue', this.fapi.formData());
        },
        open(formData) {
            this.$nextTick(() => {
                this.visible = true;
                this.value = deepCopy(formData || this.modelValue || this.formData || {});
                this.formRule = deepCopy(this.rule || []);
            })
        },
        close() {
            this.visible = false;
        },
        handleConfirm() {
            this.$emit('confirm', this.fapi);
            this.fapi.submit().then(formData => {
                this.$emit('submit', formData, this.fapi, this.close);
                if (this.autoClose) {
                    this.close();
                }
            }).catch(e => {
                this.$emit('validateFail', e, this.fapi);
            });
        },
    },
    mounted() {
        this.formCreateInject.api.top.bus.$on('fc.closeDialog', this.close);
        onUnmounted(() => {
            this.formCreateInject.api.top.bus.$off('fc.closeDialog', this.close);
        })
    }
});
</script>

<style>
._fc-dialog .el-dialog__headerbtn {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-color-info);
}

._fc-dialog .el-dialog__headerbtn:hover .fc-icon {
    color: var(--el-color-primary);
}

</style>
