<template>
    <div class="_fd-gfc">
        <el-badge :value="dataNum" type="warning" :hidden="dataNum < 1">
            <el-button class="_fd-plain-button" plain @click="open" size="small">{{ t('fetch.title') }}</el-button>
        </el-badge>
        <el-dialog class="_fd-gfc-dialog _fd-config-dialog" v-model="visible" destroy-on-close
                   :close-on-click-modal="false"
                   append-to-body
                   width="980px">
            <template #header>
                {{ t('form.globalFetch') }}
                <Warning :tooltip="t('warning.globalFetch')"></Warning>
            </template>
            <el-container class="_fd-gfc-con" style="height: 600px">
                <el-aside style="width:300px;">
                    <el-container class="_fd-gfc-l">
                        <el-header class="_fd-gfc-head" height="40px">
                            <el-dropdown trigger="click" size="default">
                                <el-button link type="primary" size="default">
                                    {{ t('fetch.create') }}<i class="fc-icon icon-down" style="font-size: 14px;"></i>
                                </el-button>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item v-for="(label, key) in types" :key="key"
                                                          @click="cusEvent(key)">
                                            <div>{{ label }}</div>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </el-header>
                        <el-main>
                            <el-menu>
                                <template v-for="(item, key) in list">
                                    <el-menu-item :class="{'is-active':key === activeIdx}">
                                        <div class="_fd-gfc-title" @click.stop="active(key)">
                                            <div class="_fd-gfc-method">
                                                <span>{{ key }}</span>
                                                <span class="_fd-label" v-if="item.label">{{ item.label }}</span>
                                            </div>
                                            <i class="fc-icon icon-delete" v-if="item.deletable !== false" @click.stop="rm(key)"></i>
                                        </div>
                                    </el-menu-item>
                                </template>
                                <el-menu-item v-if="cus" style="padding-left: 10px;">
                                    <div class="_fd-gfc-title" @click.stop>
                                        <el-input type="text" v-model="cusValue" size="default"
                                                  @keydown.enter="addCus"
                                                  :placeholder="t('fetch.placeholder')">
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
                    <el-container class="_fd-gfc-r">
                        <el-header class="_fd-gfc-head" height="40px" v-if="activeIdx">
                            <el-button size="small" @click="close">{{ t('props.cancel') }}</el-button>
                            <el-button size="small" type="primary" @click="save">{{
                                    t('props.save')
                                }}
                            </el-button>
                        </el-header>
                        <el-main v-if="activeIdx" :key="activeIdx">
                            <template v-if="list[activeIdx].type === 'fetch'">
                                <el-tabs model-value="first" class="_fc-tabs" style="width: 100%">
                                    <el-tab-pane :label="t('fetch.config')" name="first" style="padding-right: 15px;">
                                        <div class="_fd-gfc-info">
                                            {{ t('fetch.info') }}
                                        </div>
                                        <DragForm v-model:api="form.api" v-model="form.formData" :rule="form.rule"
                                                  :option="form.options">
                                            <template #title="scope">
                                                <template v-if="scope.rule.warning">
                                                    <Warning :tooltip="scope.rule.warning">
                                                        {{ scope.rule.title }}
                                                    </Warning>
                                                </template>
                                                <template v-else>
                                                    {{ scope.rule.title }}
                                                </template>
                                            </template>
                                        </DragForm>
                                    </el-tab-pane>
                                    <el-tab-pane lazy name="second">
                                        <template #label>
                                            {{ t('fetch.parse') }}
                                            <Warning :tooltip="t('warning.fetchParse')"></Warning>
                                        </template>
                                        <FnEditor style="height: 100%;" v-model="form.parse" name="parse"
                                                  :args="[{name:'res', info: t('fetch.response')}, 'rule', 'api']"
                                                  ref="parse"></FnEditor>
                                    </el-tab-pane>
                                    <el-tab-pane lazy :label="t('fetch.onError')" name="third">
                                        <FnEditor style="height: 100%;" v-model="form.onError" name="onError"
                                                  :args="['e']"
                                                  ref="error"></FnEditor>
                                    </el-tab-pane>
                                </el-tabs>
                            </template>
                            <template v-else>
                                <StructEditor v-model="form.data" ref="data"></StructEditor>
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
import { uniqueId, deepCopy } from '@eimsnext/form-render-core';
import FnEditor from './FnEditor.vue';
import StructEditor from './StructEditor.vue';
import {defineComponent} from 'vue';
import {designerForm} from '../utils/form';
import errorMessage from '../utils/message';
import VariableConfig from './computed/VariableConfig.vue';
import Warning from './Warning.vue';

const makeRule = (t) => {
    return [
        {
            type: 'input',
            field: 'action',
            title: t('fetch.action'),
            value: '',
            validate: [{required: true, message: t('fetch.actionRequired'), trigger: 'blur'}],
            inject: true,
            on: {
                blur({self}, e) {
                    self._start = e.target.selectionStart;
                }
            },
            children: [
                {
                    type: 'VariableConfig',
                    slot: 'suffix',
                    props: {
                        popover: true,
                    },
                    inject: true,
                    on: {
                        confirm({api}, val) {
                            const rule = api.getRule('action');
                            rule.value = rule.value.substring(0, rule._start) + val + rule.value.substring(rule._start);
                        },
                    }
                }
            ]
        },
        {
            type: 'radio',
            field: 'method',
            title: t('fetch.method'),
            value: 'GET',
            options: [
                {label: 'GET', value: 'GET'},
                {label: 'POST', value: 'POST'},
            ],
            $required: true,
        },
        {
            type: 'radio',
            field: 'dataType',
            title: t('fetch.dataType'),
            warning: t('warning.fetchDataType'),
            value: 'json',
            options: [
                {label: 'JSON', value: 'json'},
                {label: 'FormData', value: 'formData'},
            ],
            $required: true,
        },
        {
            type: 'FetchTable',
            field: 'headers',
            title: t('fetch.headers'),
            value: {},
        },
        {
            type: 'FetchTable',
            field: 'query',
            title: t('fetch.query'),
            warning: t('warning.fetchQuery'),
            value: {},
        },
        {
            type: 'FetchTable',
            field: 'data',
            title: t('fetch.data'),
            warning: t('warning.fetchData'),
            value: {},
        }];
}

export default defineComponent({
    name: 'GlobalFetchConfig',
    emits: ['update:modelValue'],
    props: {
        modelValue: Object,
    },
    components: {
        Warning,
        VariableConfig,
        DragForm: designerForm.$form(),
        FnEditor,
        StructEditor
    },
    inject: ['designer'],
    data() {
        return {
            visible: false,
            activeIdx: '',
            list: {},
            cus: false,
            cusValue: '',
            form: {
                api: {},
                formData: {},
                rule: [],
                options: {
                    form: {
                        labelWidth: '90px',
                        size: 'small'
                    },
                    submitBtn: false,
                    resetBtn: false,
                }
            },
        };
    },
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        types() {
            return {fetch: this.t('fetch.remote'), static: this.t('fetch.static')}
        },
        dataNum() {
            return Object.keys(this.modelValue || {}).length;
        }
    },
    watch: {
        visible(v) {
            if (v) {
                this.list = deepCopy(this.modelValue || {});
                this.activeIdx = '';
            }
        },
    },
    methods: {
        open() {
            this.visible = true;
        },
        active(key) {
            if (this.activeIdx !== key) {
                const formData = this.list[key];
                this.form.rule = formData.type === 'static' ? [] : makeRule(this.t);
                this.form.formData = {...formData};
                this.form.label = formData.label;
                this.form.type = formData.type;
                this.form.data = formData.data;
                this.form.dataType = formData.dataType;
                this.form.parse = formData.parse || '';
                this.form.onError = formData.onError || '';
                this.activeIdx = key;
            }
        },
        addCus() {
            const label = this.cusValue && this.cusValue.trim();
            if (label) {
                const key = 'data_' + uniqueId();
                this.list[key] = {
                    label,
                    type: this.cus,
                    data: [],
                };
                this.active(key);
                this.closeCus();
            }
        },
        closeCus() {
            this.cus = false;
            this.cusValue = '';
        },
        cusEvent(type) {
            this.cus = type;
        },
        saveData() {
            if (!this.$refs.data.save()) {
                return;
            }
            this.list[this.activeIdx].data = this.form.data || [];
            this.activeIdx = '';
        },
        save() {
            if (this.list[this.activeIdx].type === 'static') {
                return this.saveData();
            }
            this.form.api.validate().then(() => {
                const formData = {...this.form.formData};
                if ((this.$refs.parse && !this.$refs.parse.save()) || (this.$refs.error && !this.$refs.error.save())) {
                    return;
                }
                formData.parse = this.form.parse;
                formData.onError = this.form.onError;
                formData.label = this.form.label;
                formData.type = this.form.type;
                this.list[this.activeIdx] = formData;
                this.activeIdx = '';
            }).catch(err => {
                console.error(err);
                errorMessage(err[Object.keys(err)[0]][0].message);
            });
        },
        rm(key) {
            delete this.list[key];
            if (key === this.activeIdx) {
                this.activeIdx = '';
            }
        },
        close() {
            this.activeIdx = '';
        },
        submit() {
            if (this.activeIdx) {
                return errorMessage(this.t('event.saveMsg'));
            }
            this.$emit('update:modelValue', {...this.list});
            this.visible = false;
        },
    }
});
</script>

<style>
._fd-gfc, ._fd-gfc .el-badge {
    width: 100%;
}

._fd-gfc .el-button {
    font-weight: 400;
    width: 100%;
}

._fd-gfc-dialog .el-tabs__header {
    margin-bottom: 0;
}

._fd-gfc-dialog .form-create {
    margin-top: 15px;
}

._fd-gfc-dialog ._fc-tabs {
    display: flex;
    height: 100%;
}

._fd-gfc-dialog ._fc-tabs .el-tabs__content {
    display: flex;
    flex: 1;
    overflow: auto;
}

._fd-gfc-info {
    display: flex;
    font-size: 12px;
    position: relative;
    margin-top: 8px;
    margin-left: 15px;
    padding: 8px 13px;
    line-height: 18px;
    background: rgba(170, 170, 170, 0.1);
    border-radius: 6px;
    color: var(--fc-text-color-2);
}


._fd-gfc-con .el-main {
    padding: 0;
}

._fd-gfc-l, ._fd-gfc-r {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    border: 1px solid var(--fc-line-color-3);
}

._fd-gfc-head {
    display: flex;
    padding: 5px 15px;
    border-bottom: 1px solid var(--fc-line-color-3);
    background: var(--fc-bg-color-3);
    align-items: center;
}

._fd-gfc-head .el-button.is-link {
    color: var(--fc-style-color-1);
}

._fd-gfc-r {
    border-left: 0 none;
}

._fd-gfc-r ._fd-gfc-head {
    justify-content: flex-end;
}

._fd-gfc-l > .el-main, ._fd-gfc-r > .el-main {
    display: flex;
    flex-direction: row;
    flex: 1;
    flex-basis: auto;
    box-sizing: border-box;
    min-width: 0;
    width: 100%;
}

._fd-gfc-r > .el-main {
    flex-direction: column;
}

._fd-gfc-l .el-menu {
    padding: 0 10px 5px;
    border-right: 0 none;
    width: 100%;
    border-top: 0 none;
    overflow: auto;
}

._fd-gfc-l .el-menu-item.is-active {
    background: var(--fc-bg-color-3);
    color: var(--fc-text-color-2);
}

._fd-gfc-l .el-menu-item {
    height: auto;
    line-height: 1em;
    border: 1px solid var(--fc-line-color-3);
    border-radius: 5px;
    padding: 0;
    margin-top: 5px;
}

._fd-gfc-method {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    font-size: 14px;
    font-family: monospace;
    color: #702C71;
    overflow: hidden;
    white-space: pre-wrap;
}

._fd-gfc-method ._fd-label {
    margin-top: 4px;
    color: var(--fc-text-color-3);
    font-size: 12px;
}

._fd-gfc-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 0;
}

._fd-gfc-title .el-input {
    width: 200px;
}

._fd-gfc-title .fc-icon {
    margin-right: 6px;
    font-size: 18px;
    color: var(--fc-text-color-2);
}

._fd-gfc-title .el-input__wrapper {
    box-shadow: none;
}

._fd-gfc-title .el-menu-item.is-active i {
    color: var(--fc-text-color-2);
}

._fd-gfc-con .CodeMirror {
    height: 100%;
    width: 100%;
}

._fd-gfc-con .CodeMirror-wrap pre.CodeMirror-line {
    padding-left: 20px;
}
</style>
