<template>
    <div class="_fd-fetch-config">
        <el-badge type="warning" is-dot :hidden="!configured">
            <el-button class="_fd-plain-button" plain @click="visible=true" size="small">{{ t('struct.title') }}</el-button>
        </el-badge>
        <el-dialog class="_fd-fetch-dialog _fd-config-dialog" v-model="visible" destroy-on-close
                   :close-on-click-modal="false"
                   append-to-body
                   width="980px">
            <template #header>
                {{ t('fetch.optionsType.fetch') }}
                <Warning :tooltip="t('warning.fetch')"></Warning>
            </template>
            <el-container class="_fd-fetch-con" style="height: 450px;">
                <el-tabs model-value="first" class="_fc-tabs" style="width: 100%">
                    <el-tab-pane :label="t('fetch.config')" name="first" style="padding-right: 15px;">
                        <div class="_fd-fetch-info">
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
                                    {{scope.rule.title}}
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
            </el-container>
            <template #footer>
                <div>
                    <el-button size="default" @click="visible=false">{{ t('props.cancel') }}</el-button>
                    <el-button type="primary" size="default" @click="save">{{
                            t('props.ok')
                        }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { deepCopy, is } from '@eimsnext/form-render-core';
import FnEditor from './FnEditor.vue';
import StructEditor from './StructEditor.vue';
import {defineComponent} from 'vue';
import {designerForm} from '../utils/form';
import errorMessage from '../utils/message';
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
    name: 'FetchConfig',
    emits: ['update:modelValue'],
    props: {
        modelValue: [Object, String],
        to: String,
    },
    components: {
        Warning,
        DragForm: designerForm.$form(),
        FnEditor,
        StructEditor
    },
    inject: ['designer'],
    data() {
        return {
            visible: false,
            value: deepCopy(this.modelValue || {}),
            form: {
                api: {},
                formData: {},
                rule: [],
                options: {
                    form: {
                        labelWidth: '90px',
                        size: 'default'
                    },
                    submitBtn: false,
                    resetBtn: false,
                }
            }
        };
    },
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        configured() {
            return !is.empty(this.modelValue);
        },
    },
    watch: {
        visible(v) {
            if (v) {
                this.value = deepCopy(this.modelValue || {});
                this.active();
            }
        },
    },
    methods: {
        open() {
            this.visible = true;
        },
        active() {
            const formData = this.value;
            this.form.rule = formData.type === 'static' ? [] : makeRule(this.t);
            this.form.formData = {...formData};
            this.form.label = formData.label;
            this.form.type = formData.type;
            this.form.data = formData.data;
            this.form.dataType = formData.dataType;
            this.form.parse = formData.parse || '';
            this.form.onError = formData.onError || '';
        },
        save() {
            this.form.api.validate().then(() => {
                const formData = {...this.form.formData};
                if ((this.$refs.parse && !this.$refs.parse.save()) || (this.$refs.error && !this.$refs.error.save())) {
                    return;
                }
                formData.parse = this.form.parse;
                formData.onError = this.form.onError;
                formData.label = this.form.label;
                formData.type = this.form.type;
                formData.to = this.to || 'options';
                this.$emit('update:modelValue', formData);
                this.visible = false;
            }).catch(err => {
                console.error(err);
                errorMessage(err[Object.keys(err)[0]][0].message);
            });
        },
    },
    created() {
        this.active();
    }
});
</script>

<style>
._fd-fetch-config, ._fd-fetch-config .el-badge {
    width: 100%;
}

._fd-fetch-config .el-button {
    font-weight: 400;
    width: 100%;
}

._fd-fetch-dialog .el-tabs__header {
    margin-bottom: 0;
}

._fd-fetch-dialog .form-create {
    margin-top: 15px;
}

._fd-fetch-dialog ._fc-tabs {
    display: flex;
}

._fd-fetch-dialog ._fc-tabs .el-tabs__content {
    display: flex;
    flex: 1;
    overflow: auto;
}

._fd-fetch-info {
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

._fd-fetch-con .el-main {
    padding: 0;
}

._fd-fetch-con .CodeMirror {
    height: 100%;
    width: 100%;
}

._fd-fetch-con .CodeMirror-wrap pre.CodeMirror-line {
    padding-left: 20px;
}
</style>