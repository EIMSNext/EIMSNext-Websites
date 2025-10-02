<template>
    <div class="_fd-gvc">
        <el-badge :value="eventNum" type="warning" :hidden="eventNum < 1">
            <el-button class="_fd-plain-button" plain @click="open" size="small">{{t('computed.variable.btn')}}</el-button>
        </el-badge>
        <el-dialog class="_fd-gvc-dialog _fd-config-dialog" v-model="visible" destroy-on-close
                   :close-on-click-modal="false"
                   append-to-body
                   width="980px">
            <template #header>
                {{ t('computed.variable.title') }}
                <Warning :tooltip="t('warning.globalVariable')"></Warning>
            </template>
            <el-container class="_fd-gvc-con" style="height: 600px">
                <el-aside style="width:255px;">
                    <el-container class="_fd-gvc-l">
                        <el-header class="_fd-gvc-head" height="40px">
                            <el-button link type="primary" size="default" @click="cusEvent">
                                {{ t('computed.variable.create') }}
                            </el-button>
                        </el-header>
                        <el-main>
                            <el-menu>
                                <template v-for="(item, key) in value">
                                    <el-menu-item :class="{'is-active':key === activeIdx}">
                                        <div class="_fd-gvc-title" @click.stop="active(key)">
                                            <div class="_fd-gvc-method">
                                                <span>{{ key }}</span>
                                                <span class="_fd-label" v-if="item.label">{{ item.label }}</span>
                                            </div>
                                            <i class="fc-icon icon-delete" v-if="item.deletable !== false" @click.stop="rm(key)"></i>
                                        </div>
                                    </el-menu-item>
                                </template>
                                <el-menu-item v-if="cus" style="padding-left: 10px;">
                                    <div class="_fd-gvc-title" @click.stop>
                                        <el-input type="text" v-model="cusValue" size="default"
                                                  @keydown.enter="addCus"
                                                  :placeholder="t('computed.variable.placeholder')">
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
                    <el-container class="_fd-gvc-r">
                        <el-header class="_fd-gvc-head" height="40px" v-if="activeIdx">
                            <el-button size="small" @click="close">{{ t('props.cancel') }}</el-button>
                            <el-button size="small" type="primary" @click="save">{{
                                    t('props.save')
                                }}
                            </el-button>
                        </el-header>
                        <el-main v-if="activeIdx" :key="activeIdx">
                            <FnEditor ref="editor" v-model="handle" name="handle" :args="['get', 'api']"></FnEditor>
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
import { uniqueId, deepCopy } from '@eimsnext/form-render-core';
import {defineComponent} from 'vue';
import FnEditor from './FnEditor.vue';
import Warning from './Warning.vue';

export default defineComponent({
    name: 'GlobalVariableConfig',
    emits: ['update:modelValue'],
    props: {
        modelValue: Object,
    },
    components: {
        Warning,
        FnEditor,
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
        };
    },
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        eventNum() {
            return Object.keys(this.modelValue || {}).length;
        },
    },
    watch: {
        visible(v) {
            if (v) {
                this.activeIdx = '';
                this.value = deepCopy(this.modelValue || {});
            }
        },
    },
    methods: {
        open() {
            this.visible = true;
        },
        active(idx) {
            if (this.activeIdx !== idx) {
                this.handle = this.value[idx].handle || '';
                this.activeIdx = idx;
            }
        },
        addCus() {
            const label = this.cusValue && this.cusValue.trim();
            if (label) {
                const key = 'var_' + uniqueId();
                this.value[key] = {
                    label,
                    handle: '',
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
            if (!this.$refs.editor.save()) {
                return false;
            }
            this.value[this.activeIdx].handle = this.handle;
            this.activeIdx = '';
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
            if (this.activeIdx && !this.save()) {
                return;
            }
            this.$emit('update:modelValue', {...this.value});
            this.visible = false;
        },
    },
});
</script>

<style>
._fd-gvc, ._fd-gvc .el-badge {
    width: 100%;
}

._fd-gvc .el-button {
    font-weight: 400;
    width: 100%;
}

._fd-gvc-con .el-main {
    padding: 0;
}

._fd-gvc-l, ._fd-gvc-r {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    border: 1px solid var(--fc-line-color-3);
}

._fd-gvc-head {
    display: flex;
    padding: 5px 15px;
    border-bottom: 1px solid var(--fc-line-color-3);
    background: var(--fc-bg-color-3);
    align-items: center;
}

._fd-gvc-head .el-button.is-link {
    color: var(--fc-style-color-1);
}

._fd-gvc-r {
    border-left: 0 none;
}

._fd-gvc-r ._fd-gvc-head {
    justify-content: flex-end;
}

._fd-gvc-l > .el-main, ._fd-gvc-r > .el-main {
    display: flex;
    flex-direction: row;
    flex: 1;
    flex-basis: auto;
    box-sizing: border-box;
    min-width: 0;
    width: 100%;
}

._fd-gvc-r > .el-main {
    padding: 0;
    flex-direction: column;
}

._fd-gvc-l .el-menu {
    padding: 0 10px 5px;
    border-right: 0 none;
    width: 100%;
    border-top: 0 none;
    overflow: auto;
}

._fd-gvc-l .el-menu-item.is-active {
    background: var(--fc-bg-color-3);
    color: var(--fc-text-color-2);
}

._fd-gvc-l .el-menu-item {
    height: auto;
    line-height: 1em;
    border: 1px solid var(--fc-line-color-3);
    border-radius: 5px;
    padding: 0;
    margin-top: 5px;
}

._fd-gvc-method {
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

._fd-gvc-method ._fd-label {
    margin-top: 4px;
    color: var(--fc-text-color-3);
    font-size: 12px;
}

._fd-gvc-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 0;
}

._fd-gvc-title .el-input {
    width: 160px;
}

._fd-gvc-title .fc-icon {
    margin-right: 6px;
    font-size: 18px;
    color: var(--fc-text-color-2);
}

._fd-gvc-title .el-input__wrapper {
    box-shadow: none;
}

._fd-gvc-con .el-menu-item.is-active i {
    color: var(--fc-text-color-2);
}

</style>
