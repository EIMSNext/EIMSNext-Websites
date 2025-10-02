<template>
    <video
        ref="video"
        class="_fc-video-box"
        :controls="controls"
        :loop="loop"
        @pause="$emit('pause', $event)"
        @play="$emit('play', $event)"
        @ended="$emit('ended', $event)"
    ></video>
</template>

<script>
import loadjs from 'loadjs';
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'VideoBox',
    emits: ['pause', 'play', 'ended', 'error'],
    data() {
        return {
            player: null,
        };
    },
    props: {
        src: String,
        type: String,
        controls: {
            type: Boolean,
            default: true,
        },
        autoplay: Boolean,
        isLive: Boolean,
        withCredentials: Boolean,
        loop: Boolean
    },
    watch: {
        src: {
            handler: function () {
                this.$nextTick(() => {
                    loadjs.ready('mpegts', () => {
                        const video = this.$refs.video;
                        const player = window.mpegts.createPlayer({
                            isLive: this.isLive,
                            type: this.type,
                            url: this.src,
                        });

                        player.attachMediaElement(video);

                        player.on('error', (e) => {
                            this.$emit('error', e);
                        });

                        player.load();
                        if (this.autoplay) {
                            player.play().catch((e) => {
                                this.$emit('error', e);
                            });
                        }
                        this.player = player;
                    })
                })
            },
            immediate: true
        }
    },
    created() {
        if (window.mpegts) {
            loadjs.done('mpegts');
        } else if (!loadjs.isDefined('mpegts')) {
            loadjs(['https://unpkg.com/mpegts.js@1.8.0/dist/mpegts.js'], 'mpegts');
        }
    },
});
</script>

<style>
._fc-video-box {
    width: 100%;
}
</style>