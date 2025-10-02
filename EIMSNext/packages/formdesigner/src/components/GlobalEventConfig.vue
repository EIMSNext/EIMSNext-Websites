<template>
    <div class="_fd-gec">
        <el-badge :value="eventNum" type="warning" :hidden="eventNum < 1">
            <el-button class="_fd-plain-button" plain @click="open" size="small">{{ t('event.title') }}</el-button>
        </el-badge>
        <el-dialog class="_fd-gec-dialog _fd-config-dialog" v-model="visible" destroy-on-close
                   :close-on-click-modal="false"
                   append-to-body
                   width="980px">
            <template #header>
                {{ t('form.globalEvent') }}<Warning :tooltip="t('warning.globalEvent')"></Warning>
            </template>
            <el-container class="_fd-gec-con" style="height: 600px">
                <el-aside style="width:300px;">
                    <el-container class="_fd-gec-l">
                        <el-header class="_fd-gec-head" height="40px">
                            <el-button link type="primary" size="default" @click="cusEvent">
                                {{ t('event.create') }}
                            </el-button>
                        </el-header>
                        <el-main>
                            <el-menu>
                                <template v-for="(item, key) in event">
                                    <el-menu-item :class="{'is-active':key === activeIdx}">
                                        <div class="_fd-gec-title" @click.stop="active(key)">
                                            <div class="_fd-gec-method">
                                                <span>{{ key }}</span>
                                                <span class="_fd-label" v-if="item.label">{{ item.label }}</span>
                                            </div>
                                            <i class="fc-icon icon-delete" v-if="item.deletable !== false" @click.stop="rm(key)"></i>
                                        </div>
                                    </el-menu-item>
                                </template>
                                <el-menu-item v-if="cus" style="padding-left: 10px;">
                                    <div class="_fd-gec-title" @click.stop>
                                        <el-input type="text" v-model="cusValue" size="default"
                                                  @keydown.enter="addCus"
                                                  :placeholder="t('event.placeholder')">
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
                    <el-container class="_fd-gec-r">
                        <el-header class="_fd-gec-head" height="40px" v-if="activeIdx">
                            <el-button size="small" @click="close">{{ t('props.cancel') }}</el-button>
                            <el-button size="small" type="primary" @click="save">{{
                                    t('props.save')
                                }}
                            </el-button>
                        </el-header>
                        <el-main v-if="activeIdx" :key="activeIdx">
                            <FnEditor v-model="handle" name="handle" :args="fnArgs"
                                      ref="data"></FnEditor>
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
import {uniqueId,deepCopy} from '@eimsnext/form-render-core';
import FnEditor from './FnEditor.vue';
import {defineComponent} from 'vue';
import {getInjectArg} from '../utils';
import Warning from './Warning.vue';

export default defineComponent({
    name: 'GlobalEventConfig',
    emits: ['update:modelValue'],
    props: {
        modelValue: Object,
        eventName: Array,
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
            event: {},
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
        fnArgs() {
            return [getInjectArg(this.t)];
        }
    },
    watch: {
        visible(v) {
            if (v) {
                this.activeIdx = '';
                this.event = deepCopy(this.modelValue || {});
            }
        },
    },
    methods: {
        open() {
            this.visible = true;
        },
        active(idx) {
            if (this.activeIdx !== idx) {
                this.handle = this.event[idx].handle || '';
                this.activeIdx = idx;
            }
        },
        addCus() {
            const label = this.cusValue && this.cusValue.trim();
            if (label) {
                const key = 'event_' + uniqueId();
                this.event[key] = {
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
            if (!this.$refs.data.save()) {
                return false;
            }
            this.event[this.activeIdx].handle = this.handle;
            this.activeIdx = '';
            return true;
        },
        rm(key) {
            delete this.event[key];
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
            this.$emit('update:modelValue', {...this.event});
            this.visible = false;
        },
    },
    beforeCreate() {
        window.$inject = {
            $f: {},
            rule: [],
            self: {},
            option: {},
            inject: {},
            args: [],
        };
    }
});
</script>

<style>
._fd-gec, ._fd-gec .el-badge {
    width: 100%;
}

._fd-gec .el-button {
    font-weight: 400;
    width: 100%;
}

._fd-gec-con .el-main {
    padding: 0;
}

._fd-gec-l, ._fd-gec-r {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    border: 1px solid var(--fc-line-color-3);
}

._fd-gec-head {
    display: flex;
    padding: 5px 15px;
    border-bottom: 1px solid var(--fc-line-color-3);
    background: var(--fc-bg-color-3);
    align-items: center;
}

._fd-gec-head .el-button.is-link {
    color: var(--fc-style-color-1);
}

._fd-gec-r {
    border-left: 0 none;
}

._fd-gec-r ._fd-gec-head {
    justify-content: flex-end;
}

._fd-gec-l > .el-main, ._fd-gec-r > .el-main {
    display: flex;
    flex-direction: row;
    flex: 1;
    flex-basis: auto;
    box-sizing: border-box;
    min-width: 0;
    width: 100%;
}

._fd-gec-r > .el-main {
    flex-direction: column;
}

._fd-gec-l .el-menu {
    padding: 0 10px 5px;
    border-right: 0 none;
    width: 100%;
    border-top: 0 none;
    overflow: auto;
}

._fd-gec-l .el-menu-item.is-active {
    background: var(--fc-bg-color-3);
    color: var(--fc-text-color-2);
}

._fd-gec-l .el-menu-item {
    height: auto;
    line-height: 1em;
    border: 1px solid var(--fc-line-color-3);
    border-radius: 5px;
    padding: 0;
    margin-top: 5px;
}

._fd-gec-method {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 225px;
    font-size: 14px;
    font-family: monospace;
    color: #9D238C;
    overflow: hidden;
    white-space: pre-wrap;
}

._fd-gec-method ._fd-label {
    margin-top: 4px;
    color: var(--fc-text-color-3);
    font-size: 12px;
}

._fd-gec-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 0;
}

._fd-gec-title .el-input {
    width: 200px;
}

._fd-gec-title .fc-icon {
    margin-right: 6px;
    font-size: 18px;
    color: var(--fc-text-color-2);
}

._fd-gec-title .el-input__wrapper {
    box-shadow: none;
}

._fd-gec-con .el-menu-item.is-active i {
    color: var(--fc-text-color-2);
}

._fd-gec-con .CodeMirror {
    height: 100%;
    width: 100%;
}

._fd-gec-con .CodeMirror-wrap pre.CodeMirror-line {
    padding-left: 20px;
}
</style>
