<template>
    <div class="_fd-dialog el-dialog" :style="`--fc-dialog-height:${dragConHeight-23}px;`">
        <header class="el-dialog__header show-close">
            <span class="el-dialog__title">{{ title }}</span>
            <button class="el-dialog__headerbtn" type="button" style="right: 48px;" v-if="!fullscreen">
                <i class="fc-icon icon-page-max"></i></button>
            <button class="el-dialog__headerbtn" type="button">
                <i class="el-icon el-dialog__close">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                        <path fill="currentColor"
                              d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"></path>
                    </svg>
                </i>
            </button>
        </header>
        <div class="el-dialog__body">
            <slot></slot>
        </div>
        <footer class="el-dialog__footer">
            <template v-if="footer !== false">
                <el-button>{{ t('props.close') }}</el-button>
                <el-button type="primary">{{ t('props.ok') }}</el-button>
            </template>
        </footer>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'FcDialog',
    inject: ['designer'],
    inheritAttrs: false,
    props: {
        title: String,
        footer: {
            type: Boolean,
            default: true
        },
        fullscreen: Boolean,
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
._fd-dialog.el-dialog {
    width: calc(100% - 20px);
    margin: 10px;
}

._fd-dialog .el-dialog__headerbtn {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-color-info);
}

._fd-dialog .el-dialog__headerbtn:hover .fc-icon {
    color: var(--el-color-primary);
}

._fd-dialog .el-dialog__body > ._fd-drag-box {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    justify-content: flex-start;
    align-items: flex-start;
    box-sizing: border-box;
    position: relative;
    overflow: auto;
    height: calc(var(--fc-dialog-height) - 125px);
    outline: 1px dashed var(--fc-tool-border-color);
}

</style>
