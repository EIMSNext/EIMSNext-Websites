<template>
    <div class="_fd-drag-tool" @click.stop="active"
        :class="{ active: fcx.active === id, 'is-inside': inside, 'is-inline': inline }">
        <div class="_fd-drag-mask" v-if="mask"></div>
        <div class="_fd-drag-hidden" v-if="hidden">
            <i class="fc-icon icon-eye-close"></i> {{ t('props.hide') }}
        </div>
        <div class="_fd-drag-l" v-if="!hiddenBtn" @click.stop>
            <div class="_fd-drag-btn" v-if="dragBtn !== false" v-show="fcx.active === id" style="cursor: move;">
                <i class="fc-icon icon-move"></i>
            </div>
        </div>
        <div class="_fd-drag-r" v-if="btns !== false && !hiddenMenu">
            <slot name="handle">
                <div class="_fd-drag-btn" v-if="actions && actions.length > 0" @click.stop>
                    <el-dropdown trigger="click" @command="command">
                        <i class="fc-icon icon-setting"></i>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <template v-for="(label, idx) in actions">
                                    <el-dropdown-item :command="idx">
                                        {{ t(label) || label }}
                                    </el-dropdown-item>
                                </template>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
                <div class="_fd-drag-btn" @click.stop v-if="isCreate && (btns === true || btns.indexOf('create') > -1)"
                    @click="$emit('create')">
                    <i class="fc-icon icon-add"></i>
                </div>
                <div class="_fd-drag-btn" @click.stop v-if="!only && (btns === true || btns.indexOf('copy') > -1)"
                    @click="$emit('copy')">
                    <i class="fc-icon icon-copy"></i>
                </div>
                <div class="_fd-drag-btn" @click.stop
                    v-if="children && (btns === true || btns.indexOf('addChild') > -1)" @click="$emit('addChild')">
                    <i class="fc-icon icon-add-child"></i>
                </div>
                <div class="_fd-drag-btn _fd-drag-danger" @click.stop
                    v-if="btns === true || btns.indexOf('delete') > -1" @click="$emit('delete')">
                    <i class="fc-icon icon-delete"></i>
                </div>
            </slot>
        </div>
        <slot name="default"></slot>
    </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'DragTool',
    emits: ['create', 'copy', 'addChild', 'delete', 'active', 'action', 'fc.el'],
    props: {
        dragBtn: Boolean,
        children: String,
        inside: Boolean,
        inline: Boolean,
        hidden: Boolean,
        mask: Boolean,
        actions: Array,
        handleBtn: [Boolean, Array],
        formCreateInject: Object,
        unique: String,
        only: Boolean
    },
    inject: {
        fcx: {
            default: null
        },
        designer: {
            default: null
        },
        dragTool: {
            default: null
        },
    },
    provide() {
        return {
            dragTool: this
        }
    },
    computed: {
        isCreate() {
            return this.dragTool ? !!this.dragTool.children : false;
        },
        btns() {
            if (Array.isArray(this.handleBtn)) {
                return this.handleBtn.length ? this.handleBtn : false;
            }
            return this.handleBtn !== false;
        },
        id() {
            return this.unique || this.formCreateInject.id;
        },
        hiddenMenu() {
            return this.designer.setupState.hiddenDragMenu;
        },
        t() {
            return this.designer.setupState.t;
        },
        hiddenBtn() {
            return this.designer.setupState.hiddenDragBtn;
        },
    },
    methods: {
        command(idx) {
            this.$emit('action', idx);
        },
        active() {
            if (this.fcx.active === this.id) return;
            this.fcx.active = this.id;
            this.$emit('active');
        }
    },
    mounted() {
        this.$emit('fc.el', this);
    },
});
</script>

<style>
._fd-drag-tool {
    position: relative;
    display: block;
    min-height: 20px;
    min-width: 0;
    box-sizing: border-box;
    padding: 2px;
    outline: 1px dashed var(--fc-tool-border-color);
    overflow: hidden;
    word-wrap: break-word;
    word-break: break-all;
    z-index: 0;
}

._fd-drag-tool ._fd-drag-tool {
    margin: 2px;
    max-width: calc(100% - 4px);
    max-height: calc(100% - 7px);
}

._fd-drag-tool.is-inline {
    display: inline-block;
}

._fd-drag-tool.is-inside {
    width: inherit;
    height: inherit;
}

._fd-drag-tool:hover {
    outline-color: var(--fc-style-color-1);
    outline-style: solid;
    z-index: 1;
}

._fd-drag-tool:has(._fd-drag-tool:hover) {
    outline-style: dashed;
}

._fd-drag-tool:not(.active):hover>div>._fd-drag-btn {
    display: flex !important;
    opacity: 0.7;
}

._fd-drag-tool:has(._fd-drag-tool:not(.active):hover, ._fd-drag-tool.active:hover)>div>._fd-drag-btn {
    display: none !important;
}

._fd-drag-tool:has(._fd-drag-tool) {
    padding: 2px;
}

._fd-drag-tool+._fd-drag-tool {
    margin-top: 5px;
}

._fd-drag-tool.active {
    outline: 2px solid var(--fc-style-color-1) !important;
    z-index: 2;
    min-width: 80px;
    min-height: 36px;
}

._fd-drag-tool.active>div>._fd-drag-btn {
    display: flex;
}

._fd-drag-tool._fd-drop-hover ._fd-drag-box {
    padding-top: 15px !important;
    padding-bottom: 15px !important;
}

/*._fd-drag-tool._fd-drop-hover ._fd-drag-box ._fd-drag-item {
    padding-top: 5px !important;
    padding-bottom: 5px !important;
}*/

._fd-drag-tool._fd-drop-hover:hover {
    outline: 1px dashed var(--fc-tool-border-color);
}

._fd-drag-tool ._fd-drag-btn {
    display: none;
}

._fd-drag-r {
    position: absolute;
    right: 0;
    top: calc(100% - 20px);
    padding: 0 2px 2px 0;
    z-index: 1904;
}

._fd-drag-l {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1904
}

._fd-drag-btn {
    height: 18px;
    width: 18px;
    line-height: 20px;
    padding-bottom: 1px;
    float: left;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    color: var(--color-text-tertiary);
}

._fd-drag-btn:hover {
    background-color: var(--color-info-bg);
    color: var(--color-info);
}

._fd-drag-btn .el-dropdown {
    color: #fff;
}

._fd-drag-btn+._fd-drag-btn {
    margin-left: 2px;
}

._fd-drag-danger {
    background-color: transparent;
    color: var(--color-text-tertiary);
}

._fd-drag-danger:hover {
    background-color: var(--color-error-bg);
    color: var(--color-error);
}

._fd-drag-btn i {
    font-size: 14px;
}

._fd-drag-mask,
._fd-drag-hidden {
    z-index: 1900;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    ;
}

._fd-drag-hidden {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(51, 51, 51, .7);
    color: #FFFFFF;
    font-size: 14px;
}

._fd-drag-tool:hover ._fd-drag-hidden,
._fd-drag-tool.active ._fd-drag-hidden,
._fd-drag-tool:has(._fd-drag-tool.active) ._fd-drag-hidden {
    display: none;
}

._fd-drag-hidden .fc-icon {
    margin-right: 5px;
}
</style>
