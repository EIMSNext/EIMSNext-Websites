<template>
    <van-popup class="_fc-popup" closeable v-bind="$attrs" v-model:show="visible">
        <div class="_fc-popup-title">{{ title }}</div>
        <div class="_fc-popup-content">
            <component :is="Form" :option="options" :rule="formRule" :extendOption="true"
                       v-model:api="fapi"
                       :model-value="value"
                       :subForm="false"
                       @change="formChange"
                       @emit-event="$emit"></component>
        </div>
        <div class="_fc-popup-footer">
            <template v-if="footer !== false">
                <van-button block size="small" type="primary" class="fc-clock" @click="handleConfirm">{{formCreateInject.t('ok') || '确定'}}</van-button>
                <van-button block size="small" class="fc-clock" style="margin-top: 10px" @click="close">{{formCreateInject.t('close') || '关闭'}}</van-button>
            </template>
        </div>
    </van-popup>
</template>

<script>
import {deepCopy} from '@eimsnext/form-render-core';
import {defineComponent, markRaw, onUnmounted, reactive} from 'vue';

export default defineComponent({
    name: 'FcPopup',
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
        title: String
    },
    data() {
        return {
            visible: false,
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
._fc-popup.van-popup {
    display: flex;
    height: 100%;
    padding-top: 50px;
    padding-bottom: 110px;
}

._fc-popup-title {
    position: absolute;
    top: 16px;
    left: 0;
    color: #333;
    width: 100%;
    text-align: center;
    font-size: 16px;
}

._fc-popup-content {
    display: flex;
    flex: 1;
    overflow: auto;
}

._fc-popup-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px;
}
</style>
