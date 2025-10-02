<template>
    <div class="_fd-gcc">
        <el-badge :value="eventNum" type="warning" :hidden="eventNum < 1">
            <el-button class="_fd-plain-button" plain @click="open" size="small">{{ t('class.title') }}</el-button>
        </el-badge>
        <el-dialog class="_fd-gcc-dialog _fd-config-dialog" v-model="visible" destroy-on-close
                   :close-on-click-modal="false"
                   append-to-body
                   width="700px">
            <template #header>
                {{ t('form.globalClass') }}
                <Warning :tooltip="t('warning.globalClass')"></Warning>
            </template>
            <el-container class="_fd-gcc-con" style="height: 600px">
                <el-aside style="width:255px;">
                    <el-container class="_fd-gcc-l">
                        <el-header class="_fd-gcc-head" height="40px">
                            <el-button link type="primary" size="default" @click="cusEvent">
                                {{ t('class.create') }}
                            </el-button>
                        </el-header>
                        <el-main>
                            <el-menu>
                                <el-menu-item :class="{'is-active':activeStyle, '_fd-gcc-default': true}">
                                    <div class="_fd-gcc-title" @click.stop="changeStyle">
                                        <div class="_fd-gcc-method">
                                            <span class="_fd-label">{{ t('form.globalClass') }}</span>
                                        </div>
                                    </div>
                                </el-menu-item>
                                <template v-for="(item, key) in value">
                                    <el-menu-item :class="{'is-active':key === activeIdx}">
                                        <div class="_fd-gcc-title" @click.stop="active(key)">
                                            <div class="_fd-gcc-method">
                                                <span>.{{ key }}</span>
                                                <span class="_fd-label" v-if="item.label">{{ item.label }}</span>
                                            </div>
                                            <i class="fc-icon icon-delete" v-if="item.deletable !== false" @click.stop="rm(key)"></i>
                                        </div>
                                    </el-menu-item>
                                </template>
                                <el-menu-item v-if="cus" style="padding-left: 10px;">
                                    <div class="_fd-gcc-title" @click.stop>
                                        <el-input type="text" v-model="cusValue" size="default"
                                                  @keydown.enter="addCus"
                                                  :placeholder="t('class.placeholder')">
                                        </el-input>
                                        <div>
                                            <i class="fc-icon icon-add" @click.stop="addCus"></i>
                                            <i class="fc-icon icon-delete" @click.stop="closeCus"></i>
                                        </div>
                                    </div>
                                </el-menu-item>
                            </el-menu>
                        </el-main>
                    </el-container>
                </el-aside>
                <el-main>
                    <el-container class="_fd-gcc-r">
                        <el-header class="_fd-gcc-head" height="40px" v-if="activeIdx || activeStyle">
                            <el-button size="small" @click="close">{{ t('props.cancel') }}</el-button>
                            <el-button size="small" type="primary" @click="save">{{
                                    t('props.save')
                                }}
                            </el-button>
                        </el-header>
                        <el-main v-if="activeIdx || activeStyle" :key="activeIdx"
                                 :class="activeStyle ? '_fd-gcc-style' : ''">
                            <template v-if="activeStyle">
                                <StyleEditor ref="editor" v-model="content"></StyleEditor>
                            </template>
                            <template v-else>
                                <el-form size="small">
                                    <StyleConfig v-model="handle"/>
                                </el-form>
                            </template>
                        </el-main>
                    </el-container>
                </el-main>
            </el-container>
            <template #footer>
                <div>
                    <el-button size="default" @click="visible=false">{{ t('props.cancel') }}</el-button>
                    <el-button type="primary" size="default" @click="submit">{{
                            t('props.ok')
                        }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { uniqueId, deepCopy, toLine } from '@eimsnext/form-render-core';
import {defineComponent, markRaw} from 'vue';
import {getInjectArg} from '../utils';
import StyleConfig from './style/StyleConfig.vue';
import StyleEditor from './style/StyleEditor.vue';
import Warning from './Warning.vue';

export default defineComponent({
    name: 'GlobalClassConfig',
    emits: ['update:modelValue'],
    props: {
        modelValue: Object,
    },
    components: {
        Warning,
        StyleEditor,
        StyleConfig,
    },
    inject: ['designer'],
    data() {
        return {
            visible: false,
            activeIdx: '',
            value: {},
            cus: false,
            cusValue: '',
            handle: '',
            styleEl: null,
            content: '',
            activeStyle: false,
        };
    },
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        eventNum() {
            return Object.keys(this.modelValue || {}).length;
        },
        fnArgs() {
            return [getInjectArg(this.t)];
        }
    },
    watch: {
        visible(v) {
            if (v) {
                this.activeIdx = '';
                this.value = deepCopy(this.modelValue || {});
            }
        },
        modelValue() {
            this.updateGlobalStyle();
        },
    },
    methods: {
        open() {
            this.visible = true;
        },
        changeStyle() {
            this.content = this.designer.setupState.formOptions.style || '#_demo1{\n  display:flex;\n}\n\n._demo2{\n  display:flex;\n}';
            this.activeStyle = true;
            this.activeIdx = '';
        },
        active(idx) {
            this.activeStyle = false;
            if (this.activeIdx !== idx) {
                this.handle = this.value[idx].style || '';
                this.activeIdx = idx;
            }
        },
        addCus() {
            const label = this.cusValue && this.cusValue.trim();
            if (label) {
                const key = 'cls_' + uniqueId();
                this.value[key] = {
                    label,
                    style: {},
                };
                this.active(key);
                this.closeCus();
            }
        },
        closeCus() {
            this.cus = false;
            this.cusValue = '';
        },
        cusEvent() {
            this.cus = true;
        },
        save() {
            if (this.activeStyle) {
                this.$refs.editor.save();
                this.designer.setupState.formOptions.style = this.content;
                this.activeStyle = false;
            } else {
                this.value[this.activeIdx].style = this.handle;
                this.activeIdx = '';
            }
        },
        rm(key) {
            delete this.value[key];
            if (key === this.activeIdx) {
                this.activeIdx = '';
            }
        },
        close() {
            this.activeIdx = '';
        },
        submit() {
            if (this.activeIdx || this.activeStyle) {
                this.save();
            }
            this.$emit('update:modelValue', {...this.value});
            this.visible = false;
        },
        updateGlobalStyle() {
            let content = '';
            const globalClass = this.modelValue || {};
            Object.keys(globalClass).forEach(k => {
                let subCss = '';
                globalClass[k].style && Object.keys(globalClass[k].style).forEach(key => {
                    subCss += toLine(key) + ':' + globalClass[k].style[key] + ';';
                });
                if (globalClass[k].content) {
                    subCss += globalClass[k].content + ';';
                }
                if (subCss) {
                    content += `.${k}{${subCss}}`;
                }
            });
            if (content) {
                this.styleEl.innerHTML = content;
            }
        },
    },
    created() {
        this.styleEl = markRaw(document.createElement('style'));
        this.styleEl.type = 'text/css';
        document.head.appendChild(this.styleEl);
        this.updateGlobalStyle();
    },
    unmounted() {
        document.head.removeChild(this.styleEl);
    }
});
</script>

<style>
._fd-gcc, ._fd-gcc .el-badge {
    width: 100%;
}

._fd-gcc .el-button {
    font-weight: 400;
    width: 100%;
}

._fd-gcc-con .el-main {
    padding: 0;
}

._fd-gcc-l, ._fd-gcc-r {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    border: 1px solid var(--fc-line-color-3);
}

._fd-gcc-head {
    display: flex;
    padding: 5px 15px;
    border-bottom: 1px solid var(--fc-line-color-3);
    background: var(--fc-bg-color-3);
    align-items: center;
}

._fd-gcc-head .el-button.is-link {
    color: var(--fc-style-color-1);
}

._fd-gcc-r {
    border-left: 0 none;
}

._fd-gcc-r ._fd-gcc-head {
    justify-content: flex-end;
}

._fd-gcc-l > .el-main, ._fd-gcc-r > .el-main {
    display: flex;
    flex-direction: row;
    flex: 1;
    flex-basis: auto;
    box-sizing: border-box;
    min-width: 0;
    width: 100%;
}

._fd-gcc-r > .el-main {
    padding: 20px;
    flex-direction: column;
}

._fd-gcc-r > .el-main._fd-gcc-style {
    padding: 0;
}

._fd-gcc-r .el-form-item {
    margin-bottom: 10px !important;
}

._fd-gcc-l .el-menu {
    padding: 0 10px 5px;
    border-right: 0 none;
    width: 100%;
    border-top: 0 none;
    overflow: auto;
}

._fd-gcc-l .el-menu-item.is-active {
    background: var(--fc-bg-color-3);
    color: var(--fc-style-color-1);
}

._fd-gcc-l .el-menu-item {
    height: auto;
    line-height: 1em;
    border: 1px solid var(--fc-line-color-3);
    border-radius: 5px;
    padding: 0;
    margin-top: 5px;
}

._fd-gcc-default.is-active ._fd-label {
    color: var(--fc-style-color-1);
    margin-top: 0;
}

._fd-gcc-method {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 175px;
    font-size: 14px;
    font-family: monospace;
    overflow: hidden;
    white-space: pre-wrap;
    color: #923B76;
}

._fd-gcc-method ._fd-label {
    color: var(--fc-text-color-3);
    font-size: 12px;
}

._fd-gcc-method span + ._fd-label {
    margin-top: 4px;
}

._fd-gcc-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 0;
}

._fd-gcc-title .el-input {
    width: 160px;
}

._fd-gcc-title .fc-icon {
    margin-right: 6px;
    font-size: 18px;
    color: var(--fc-text-color-2);
}

._fd-gcc-title .el-input__wrapper {
    box-shadow: none;
}

._fd-gcc-con .el-menu-item.is-active i {
    color: var(--fc-text-color-2);
}

</style>
