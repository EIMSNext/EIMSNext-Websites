<template>
    <div class="van-popup van-popup--bottom _fd-popup" :style="`--fc-dialog-height:${dragConHeight-23}px;`">
        <i class="van-badge__wrapper van-icon van-icon-cross van-popup__close-icon van-popup__close-icon--top-right van-haptics-feedback"></i>
        <div class="_fd-popup-title">{{ title }}</div>
        <div class="_fd-popup-content">
            <slot></slot>
        </div>
        <div class="_fd-popup-footer">
            <template v-if="footer !== false">
                <van-button block size="small" type="primary" class="fc-clock">{{ t('props.ok') }}</van-button>
                <van-button block size="small" class="fc-clock" style="margin-top: 10px">{{ t('props.close') }}</van-button>
            </template>
        </div>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'FcPopup',
    inject: ['designer'],
    inheritAttrs: false,
    props: {
        title: String,
        footer: {
            type: Boolean,
            default: true
        },
    },
    computed: {
        dragConHeight() {
            return this.designer.setupState.dragConHeight;
        },
        t() {
            return this.designer.setupState.t;
        },
    },
});
</script>

<style>
._fd-popup.van-popup {
    width: calc(100% - 20px);
    margin: 10px;
    position: relative;
    overflow: auto;
    padding-top: 50px;
    background: var(--fc-bg-color-1);
}

._fd-popup-content {
    display: flex;
    flex: 1;
    height: calc(var(--fc-dialog-height) - 152px);
    overflow: auto;
    padding: 1px;
    margin-bottom: 5px;
}

._fd-popup-content > ._fd-drag-box {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    justify-content: flex-start;
    align-items: flex-start;
    box-sizing: border-box;
    position: relative;
    overflow: auto;
    height: calc(var(--fc-dialog-height) - 105px);
    outline: 1px dashed var(--fc-tool-border-color);
}


._fd-popup-content ._fd-drag-box {
    outline: 1px dashed var(--fc-line-color-3);
}

._fd-popup-title {
    position: absolute;
    top: 16px;
    left: 0;
    color: #333;
    width: 100%;
    text-align: center;
    font-size: 16px;
}

</style>
