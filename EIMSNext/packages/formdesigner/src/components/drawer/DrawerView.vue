<template>
    <div class="el-drawer _fd-drawer" :style="`--fc-drawer-height:${dragConHeight-23}px;`">
        <span class="el-drawer__sr-focus" tabindex="-1"></span>
        <header class="el-drawer__header">
            <span>{{ title }}</span>
            <button class="el-drawer__close-btn" type="button" v-if="size !== '100%'">
                <i class="fc-icon icon-page-max"></i></button>
            <button class="el-drawer__close-btn" type="button">
                <i class="el-icon el-drawer__close">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                        <path fill="currentColor"
                              d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"></path>
                    </svg>
                </i></button>
        </header>
        <div class="el-drawer__body">
            <slot></slot>
        </div>
        <div class="el-drawer__footer">
            <template v-if="footer !== false">
                <el-button>{{ t('props.close') }}</el-button>
                <el-button type="primary">{{ t('props.ok') }}</el-button>
            </template>
        </div>
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
        size: String,
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
._fd-drawer.el-drawer {
    width: 100%;
    box-shadow: unset;
}

._fd-drawer .el-drawer__header {
    border-bottom: 1px solid var(--fc-line-color-3);
    padding: 14px 24px 14px 20px;
    margin-bottom: 0;
    font-size: 15px;
    font-weight: 600;
    color: #333
}

._fd-drawer .el-drawer__body {
    padding: 12px;
}

._fd-drawer .el-drawer__close-btn {
    font-size: 14px;
    color: #909399
}

._fd-drawer .el-drawer__footer {
    box-shadow: 0 -2px 4px 0 rgba(0, 0, 0, .05);
    text-align: center;
    padding: 10px 0;
}

._fd-drawer .el-drawer__body > ._fd-drag-box {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    justify-content: flex-start;
    align-items: flex-start;
    box-sizing: border-box;
    position: relative;
    overflow: auto;
    height: calc(var(--fc-drawer-height) - 105px);
    outline: 1px dashed var(--fc-tool-border-color);
}

</style>
