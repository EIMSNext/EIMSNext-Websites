<template>
    <iframe
        class="_fc-iframe-box"
        :src="src"
        frameborder="0"
        @load="$emit('load', $event)"
    ></iframe>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'IframeBox',
    emits: ['load'],
    data() {
        return {};
    },
    props: {
        src: String,
        loading: String,
    },
});
</script>

<style>
._fc-iframe-box {
    width: 100%;
}
</style>
