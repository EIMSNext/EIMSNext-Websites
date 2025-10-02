<template>
    <div class="_fc-infinite-table-form" :class="{'_fc-disabled': disabled}">
        <component :is="Form" :option="options" :rule="rule" :extendOption="true"
                   @change="formChange"
                   :disabled="disabled"
                   v-model:api="fapi"
                   @emit-event="$emit"></component>
        <el-button link type="primary" class="fc-clock" v-if="!max || max > this.trs.length"
                   @click="addRaw(true)"><i class="fc-icon icon-add-circle" style="font-weight: 700;"></i>
            {{ formCreateInject.t('add') || '添加' }}
        </el-button>
    </div>
</template>

<script>
import {markRaw, reactive} from 'vue';
import { deepCopy,hasProperty } from '@eimsnext/form-render-core';

export default {
    name: 'InfiniteTableForm',
    emits: ['change', 'add', 'delete', 'update:modelValue'],
    props: {
        formCreateInject: Object,
        modelValue: {
            type: Array,
            default: () => [],
        },
        columns: {
            type: Array,
            required: true,
            default: () => []
        },
        options: {
            type: Object,
            default: () => reactive(({
                submitBtn: false,
                resetBtn: false,
            }))
        },
        max: Number,
        layerMax: {
            type: Number,
            default: 0,
        },
        childrenField: String,
        disabled: Boolean,
    },
    computed: {
        preview() {
            return this.formCreateInject.preview;
        },
        subField() {
            return this.childrenField || 'children';
        },
    },
    watch: {
        modelValue() {
            this.updateTable()
        },
        'formCreateInject.preview'(n) {
            this.trs.forEach((tr, i) => {
                if (tr.children[1]) {
                    tr.children[1].children[0].props.colspan = this.rule[0].children[0].children[0].children.length - (n ? 1 : 0);
                }
                tr.children[0].children[0].children[0].hidden = this.layerMax === 1 || n && !(this.modelValue && this.modelValue[i] && Array.isArray(this.modelValue[i][this.subField]) && this.modelValue[i][this.subField].length > 0);
            });
        },
    },
    data() {
        return {
            rule: [],
            trs: [],
            fapi: {},
            Form: markRaw(this.formCreateInject.form.$form()),
            copyTrs: '',
            oldValue: ''
        };
    },
    methods: {
        formChange(field, _, rule, api, flag) {
            if (false === flag) {
                this.updateValue();
            }
        },
        updateValue() {
            const value = this.trs.map((tr, idx) => {
                const formData = {
                    ...(this.modelValue[idx] || {}),
                    ...this.fapi.getChildrenFormData(tr)
                }
                if (!hasProperty(formData, this.subField) && this.modelValue[idx]) {
                    formData[this.subField] = this.modelValue[idx][this.subField];
                }
                if (formData[this.subField] == null) {
                    delete formData[this.subField];
                }
                return formData;
            });
            const str = JSON.stringify(value);
            if (str !== this.oldValue) {
                this.oldValue = str;
                this.$emit('update:modelValue', value);
                this.$emit('change', value);
            }
        },
        setRawData(idx, formData) {
            const raw = this.trs[idx];
            this.fapi.setChildrenFormData(raw, formData, true);
        },
        updateTable() {
            const str = JSON.stringify(this.modelValue);
            if (this.oldValue === str) {
                return;
            }
            this.oldValue = str;
            this.trs = this.trs.splice(0, this.modelValue.length);
            if (!this.modelValue.length) {
                this.addRaw();
            }
            this.modelValue.forEach((data, idx) => {
                if (!this.trs[idx]) {
                    this.addRaw();
                }
                this.setRawData(idx, data || {});
            });
            this.rule[0].children[1].children = this.trs;
        },
        delRaw(idx) {
            if (this.disabled) {
                return;
            }
            this.trs.splice(idx, 1);
            this.updateValue();
            if (this.trs.length) {
                this.trs.forEach(tr => this.updateRaw(tr));
            } else {
                this.addRaw();
            }
            this.$emit('delete', idx);
        },
        addRaw(flag) {
            if (flag && this.disabled) {
                return;
            }
            const tr = this.formCreateInject.form.parseJson(this.copyTrs)[0];
            const template = {
                type: 'template',
                subRule: true,
                children: []
            };
            template.children.push(tr);
            this.trs.push(template);
            this.trs.forEach(tr => this.updateRaw(tr));
            flag && this.$emit('add', this.trs);
        },
        updateRaw(tr) {
            const idx = this.trs.indexOf(tr);
            const row = tr.children[0];
            row.children[0].children[0].hidden = this.layerMax === 1 || this.preview && !(this.modelValue && this.modelValue[idx] && Array.isArray(this.modelValue[idx][this.subField]) && this.modelValue[idx][this.subField].length > 0);
            row.children[0].children[0].props.onClick = (inject) => {
                if (this.trs[idx].children.length === 1) {
                    if (this.disabled && !(this.modelValue && this.modelValue[idx] && Array.isArray(this.modelValue[idx][this.subField]) && this.modelValue[idx][this.subField].length > 0)) {
                        return;
                    }
                    this.trs[idx].children.push({
                        type: 'tr',
                        native: true,
                        display: true,
                        children: [{
                            type: 'td',
                            native: true,
                            props: {
                                colspan: this.rule[0].children[0].children[0].children.length - (this.preview ? 1 : 0),
                            },
                            class: '_fc-itf-sub',
                            children: [{
                                type: 'infiniteTableForm',
                                field: this.subField,
                                value: [...((this.modelValue[idx] && this.modelValue[idx][this.subField]) || [])],
                                props: {
                                    disabled: this.disabled,
                                    layerMax: this.layerMax === 0 ? 0 : (this.layerMax > 1 ? this.layerMax - 1 : 1),
                                    max: this.max || 0,
                                    columns: deepCopy(this.columns),
                                    options: deepCopy(this.options),
                                }
                            }]
                        }]
                    });
                }
                const icon = inject.self.children[0] === '-' ? '+' : '-';
                inject.self.children = [icon];
                this.trs[idx].children[1].display = icon === '-';
            };
            row.children[1].props.innerText = idx + 1;
            row.children[row.children.length - 1].children[0].props.onClick = () => {
                this.delRaw(idx);
            };
        },

        loadRule() {
            const header = [{
                type: 'th',
                native: true,
                class: '_fc-itf-sub-idx',
            }, {
                type: 'th',
                native: true,
                class: '_fc-itf-head-idx',
                props: {
                    innerText: '#'
                }
            }];
            let body = [{
                type: 'td',
                class: '_fc-itf-idx',
                native: true,
                children: [
                    {
                        type: 'div',
                        hidden: false,
                        children: ['+'],
                        inject: true,
                        props: {}
                    },
                ]
            }, {
                type: 'td',
                class: '_fc-itf-idx',
                native: true,
                props: {
                    innerText: '0'
                }
            }];
            this.columns.forEach((column) => {
                header.push({
                    type: 'th',
                    native: true,
                    class: column.required ? '_fc-itf-head-required' : '',
                    style: column.style,
                    props: {
                        innerText: column.label || ''
                    }
                });
                body.push({
                    type: 'td',
                    native: true,
                    children: [...(column.rule || [])]
                });
            });
            header.push({
                type: 'th',
                native: true,
                class: '_fc-itf-edit fc-clock',
                props: {
                    innerText: this.formCreateInject.t('operation') || '操作'
                }
            });
            body.push({
                type: 'td',
                native: true,
                class: '_fc-itf-btn fc-clock',
                children: [
                    {
                        type: 'i',
                        native: true,
                        class: 'fc-icon icon-delete',
                        props: {},
                    }
                ],
            });
            this.copyTrs = this.formCreateInject.form.toJson([
                {
                    type: 'tr',
                    native: true,
                    children: body
                }
            ]);
            this.rule = [
                {
                    type: 'table',
                    native: true,
                    class: '_fc-itf-table',
                    props: {
                        border: '1',
                        cellspacing: '0',
                        cellpadding: '0',
                    },
                    children: [
                        {
                            type: 'thead',
                            native: true,
                            children: [
                                {
                                    type: 'tr',
                                    native: true,
                                    children: header
                                }
                            ]
                        },
                        {
                            type: 'tbody',
                            native: true,
                            children: this.trs
                        }
                    ]
                }
            ]
        },
    },
    created() {
        this.loadRule();
    },
    mounted() {
        this.updateTable();
    }
};
</script>

<style>
._fc-infinite-table-form {
    overflow: auto;
    color: var(--fc-text-color-2);
}

._fc-infinite-table-form .form-create .el-form-item {
    margin-bottom: 1px;
}

._fc-infinite-table-form .form-create .el-form-item.is-error {
    margin-bottom: 22px;
}

._fc-infinite-table-form .el-form-item__label, ._fc-infinite-table-form .van-field__label {
    display: none !important;
}

._fc-infinite-table-form .el-form-item__content {
    display: flex;
    margin-left: 0px !important;
    width: 100% !important;
}

._fc-itf-table ._fc-itf-head-idx, ._fc-itf-table ._fc-itf-idx {
    width: 40px;
    min-width: 40px;
    font-weight: 500;
    text-align: center;
    padding: 0;
}

._fc-itf-idx div {
    display: inline-flex;
    justify-content: center;
    width: 18px;
    height: 18px;
    line-height: 16px;
    border: 1px solid #bfbfbf;
    border-radius: 6px;
    cursor: pointer;
}

._fc-itf-sub-idx {
    width: 30px;
}

._fc-itf-edit, ._fc-itf-btn {
    width: 70px;
    min-width: 70px;
    text-align: center;
}

._fc-itf-btn .fc-icon {
    cursor: pointer;
}

._fc-infinite-table-form._fc-disabled ._fc-itf-btn .fc-icon, ._fc-infinite-table-form._fc-disabled > .el-button {
    cursor: not-allowed;
}

._fc-itf-table {
    width: 100%;
    height: 100%;
    overflow: hidden;
    table-layout: fixed;
    border: 1px solid #EBEEF5;
    border-bottom: 0 none;
}

._fc-itf-table > thead > tr > th {
    border: 0 none;
    border-bottom: 1px solid #EBEEF5;
    height: 40px;
    font-weight: 500;
}

._fc-itf-table ._fc-itf-table > thead {
    display: none;
}

._fc-itf-table ._fc-itf-table {
    border-right: 0 none;
}

._fc-itf-table > thead > tr > th + th {
    border-left: 1px solid #EBEEF5;
}

._fc-itf-table tr {
    min-height: 50px;
}

._fc-itf-table ._fc-read-view {
    text-align: center;
    width: 100%;
}

._fc-itf-table td {
    padding: 10px;
    min-height: 50px;
    min-width: 80px;
    position: relative;
    box-sizing: border-box;
    overflow-wrap: break-word;
    /*white-space: nowrap;*/
    overflow: hidden;
    border: 0 none;
    border-bottom: 1px solid #EBEEF5;
}

._fc-itf-table td + td {
    border-left: 1px solid #EBEEF5;
}

._fc-itf-table .el-input-number, ._fc-itf-table .el-select, ._fc-itf-table .el-slider, ._fc-itf-table .el-cascader, ._fc-itf-table .el-date-editor {
    width: 100%;
}

._fc-infinite-table-form ._fc-itf-sub {
    padding: 5px 0 5px 10px;
}

._fc-itf-sub ._fc-table-form {
    background-color: var(--fc-bg-color-1);
}

._fc-itf-sub ._fc-tf-table {
    border: 0 none;
}

/*._fc-itf-sub ._fc-tf-table thead {
    background: #fafafa;
}*/

._fc-itf-sub-idx + ._fc-itf-head-idx, ._fc-itf-idx + ._fc-itf-idx {
    border-left: 0 none;
}

._fc-itf-head-required:before {
    content: '*';
    color: #f56c6c;
    margin-right: 4px;
}
</style>
