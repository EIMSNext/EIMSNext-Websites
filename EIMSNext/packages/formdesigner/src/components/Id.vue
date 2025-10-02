<template>
    <el-input :modelValue="designer ? ('' + (prefix || '') + preview) : modelValue" readonly disabled></el-input>
</template>

<script>
import {defineComponent} from 'vue';
import SnowflakeId from 'snowflake-id';

export default defineComponent({
    name: 'FcId',
    props: ['modelValue', 'prefix'],
    emits: ['update:modelValue'],
    inject: {
        designer: {
            default: null
        }
    },
    data() {
        return {
            preview: '7379787000000000'
        }
    },
    watch: {
        modelValue: {
            handler: function (val) {
                if (!val) {
                    const snowflake = new SnowflakeId({
                        mid: 42,
                        offset: (2025 - 1970) * 31536000 * 1000
                    });
                    this.$emit('update:modelValue', '' + (this.prefix || '') + snowflake.generate());
                }
            },
            immediate: true,
        },
    }
});
</script>

