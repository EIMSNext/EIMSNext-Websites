<template>
    <el-drawer class="_fc-drawer" v-bind="$attrs" :size="max ? '100%' : size" v-model="visible" destroyOnClose>
        <template #header>
            <span class="el-drawer__title">
                {{ title }}
            </span>
            <button class="el-drawer__close-btn" type="button" v-if="size !== '100%'">
                <i class="fc-icon icon-page-min" v-if="max" @click="max=false"></i>
                <i class="fc-icon icon-page-max" v-else @click="max=true"></i>
            </button>
        </template>
        <component :is="Form" :option="options" :rule="formRule" :extendOption="true"
                   v-model:api="fapi"
                   :model-value="value"
                   :subForm="false"
                   @change="formChange"
                   @emit-event="$emit"></component>
        <template #footer>
            <template v-if="footer !== false">
                <el-button @click="close">{{formCreateInject.t('close') || '关闭'}}</el-button>
                <el-button type="primary" @click="handleConfirm">{{formCreateInject.t('ok') || '确定'}}</el-button>
            </template>
        </template>
    </el-drawer>
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
        size: [Number, String],
        title: String,
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
            max: this.size === '100%',
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
            });
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
._fc-drawer .el-drawer__header {
    border-bottom: 1px solid var(--fc-line-color-3);
    padding: 14px 24px 14px 20px;
    margin-bottom: 0;
    font-size: 15px;
    font-weight: 600;
    color: #333
}

._fc-drawer .el-drawer__body {
    padding: 10px 24px 50px 24px;
}

._fc-drawer .el-drawer__close-btn {
    font-size: 14px;
    color: #909399
}

._fc-drawer .el-drawer__footer {
    z-index: 10;
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    background: var(--fc-bg-color-1);
    box-shadow: 0 -2px 4px 0 rgba(0, 0, 0, .05);
    text-align: center;
    padding: 10px 0;
}

</style>
