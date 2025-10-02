<template>
    <img class="_fc-barcode" ref="bar"/>
</template>

<script>
import {defineComponent} from 'vue';
import JsBarcode from 'jsbarcode'

export default defineComponent({
    name: 'BarCodeBox',
    data() {
        return {};
    },
    props: {
        value: String,
        format: String,
        displayValue: {
            type: Boolean,
            default: true,
        },
        fontSize: Number,
        textPosition: String,
        textAlign: String,
        textMargin: Number,
        width: {
            type: Number,
            default: 2,
        },
        height: {
            type: Number,
            default: 50,
        },
        background: String,
        lineColor: String,
    },
    methods: {},
    computed: {},
    components: {},
    watch: {
        '$props': {
            handler() {
                const value = this.value;
                const options = {};
                Object.keys(this.$props).forEach((key) => {
                    if (this.$props[key] != null && this.$props[key] !== '') {
                        options[key] = this.$props[key];
                    }
                });
                delete options.value;
                delete options.formCreateInject;
                this.$nextTick(() => {
                    JsBarcode(this.$refs.bar, value || '', options);
                });
            },
            deep: true,
            immediate: true,
        }
    },
});
</script>
