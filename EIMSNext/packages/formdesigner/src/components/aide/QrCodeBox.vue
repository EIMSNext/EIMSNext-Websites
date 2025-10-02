<template>
    <div class="_fc-qrcode" ref="qr"/>
</template>

<script>
import {defineComponent, markRaw} from 'vue';
import QRCodeStyling from 'qr-code-styling';

export default defineComponent({
    name: 'QrCodeBox',
    data() {
        return {
            qrcode: null,
        };
    },
    props: {
        data: String,
        image: String,
        width: Number,
        height: Number,
        circleType: String,
        circleColor: String,
    },
    methods: {},
    computed: {},
    components: {},
    watch: {
        '$props': {
            handler() {
                const options = {
                    dotsOptions: {}
                };
                Object.keys(this.$props).forEach((key) => {
                    if (this.$props[key] != null && this.$props[key] !== '') {
                        options[key] = this.$props[key];
                    }
                });
                delete options.formCreateInject;
                if (options.circleType) {
                    options.dotsOptions.type = options.circleType;
                }
                if (options.circleColor) {
                    options.dotsOptions.color = options.circleColor;
                }
                delete options.circleColor;
                delete options.circleType;
                this.$nextTick(() => {
                    if (this.qrcode) {
                        this.qrcode.update(options);
                    } else {
                        this.qrcode = markRaw(new QRCodeStyling(options));
                        this.qrcode.append(this.$refs.qr);
                    }
                });
            },
            deep: true,
            immediate: true,
        }
    },
});
</script>
