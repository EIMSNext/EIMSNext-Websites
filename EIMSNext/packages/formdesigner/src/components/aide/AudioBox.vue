<template>
    <audio
        :key="src"
        :controls="controls"
        :autoplay="autoplay"
        :loop="loop"
        :preload="preload"
        :muted="muted"
        @pause="$emit('pause', $event)"
        @play="$emit('play', $event)"
        @ended="$emit('ended', $event)"
    >
        <source
            :src="src"
            :type="type"
        />
        Your browser does not support the audio element.
    </audio>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'AudioBox',
    emits: ['pause', 'play', 'ended'],
    data() {
        return {};
    },
    props: {
        src: String,
        type: String,
        controls: {
            type: Boolean,
            default: true,
        },
        autoplay: Boolean,
        loop: Boolean,
        preload: {
            type: String,
            default: 'auto',
        },
        muted: Boolean,
    },
});
</script>
