<template>
    <div class="_fc-value">
        {{ modelValue }}
    </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'FcValue',
    props: ['modelValue'],
    watch: {
        modelValue(n) {
            this.$emit('change', n);
        },
    }
});
</script>

