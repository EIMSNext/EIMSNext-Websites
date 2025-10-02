<template>
    <div class="_fc-nested-table-form" :class="{'_fc-disabled': disabled}">
        <component :is="Form" :option="options" :rule="rule" :extendOption="true"
                   @change="formChange"
                   :disabled="disabled"
                   v-model:api="fapi"
                   @emit-event="$emit"></component>
        <el-button link type="primary" class="fc-clock" v-if="!max || max > this.trs.length"
                   @click="addRaw(true)"><i class="fc-icon icon-add-circle" style="font-weight: 700;"></i>
            {{formCreateInject.t('add') || '添加'}}
        </el-button>
    </div>
</template>

<script>
import {markRaw, reactive} from 'vue';
import { deepCopy } from '@eimsnext/form-render-core';

export default {
    name: 'NestedTableForm',
    emits: ['change', 'add', 'delete', 'update:modelValue'],
    props: {
        formCreateInject: Object,
        modelValue: {
            type: Array,
            default: () => [],
        },
        nested: Array,
        nestedField: String,
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
        nestedMax: Number,
        disabled: Boolean,
    },
    computed: {
        preview() {
            return this.formCreateInject.preview;
        },
    },
    watch: {
        modelValue() {
            this.updateTable()
        },
        'formCreateInject.preview'(n) {
            this.trs.forEach(tr => {
                const colspan = tr.children[1].children[0].props.colspan;
                tr.children[1].children[0].props.colspan = n ? colspan - 1 : colspan + 1;
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
                return {
                    ...(this.modelValue[idx] || {}),
                    ...this.fapi.getChildrenFormData(tr)
                }
            }).filter(v => {
                if (v === undefined || v === null) {
                    return false;
                }
                let flag = false;
                Object.keys(v).forEach(k => {
                    if (flag) {
                        return;
                    }
                    flag = flag || (v[k] !== undefined && v[k] !== '' && v[k] !== null && (Array.isArray(v[k]) ? !!v[k].length : true))
                })
                return flag;
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
            template.children.push({
                type: 'tr',
                native: true,
                display: false,
                children: [{
                    type: 'td',
                    native: true,
                    props: {
                        colspan: tr.children.length - (this.preview ? 1 : 0),
                    },
                    class: '_fc-ntf-sub',
                    children: [{
                        type: 'TableForm', field: this.nestedField, value: [], props: {
                            disabled: this.disabled,
                            max: this.nestedMax || 0,
                            columns: deepCopy(this.nested),
                            options: deepCopy(this.options),
                        }
                    }]
                }]
            });
            this.trs.push(template);
            this.updateRaw(template);
            flag && this.$emit('add', this.trs);
        },
        updateRaw(tr) {
            const idx = this.trs.indexOf(tr);
            const row = tr.children[0];
            row.children[0].children[0].props.onClick = (inject) => {
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
                class: '_fc-ntf-sub-idx',
            }, {
                type: 'th',
                native: true,
                class: '_fc-ntf-head-idx',
                props: {
                    innerText: '#'
                }
            }];
            let body = [{
                type: 'td',
                class: '_fc-ntf-idx',
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
                class: '_fc-ntf-idx',
                native: true,
                props: {
                    innerText: '0'
                }
            }];
            this.columns.forEach((column) => {
                header.push({
                    type: 'th',
                    native: true,
                    class: column.required ? '_fc-ntf-head-required' : '',
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
                class: '_fc-ntf-edit fc-clock',
                props: {
                    innerText: this.formCreateInject.t('operation') || '操作'
                }
            });
            body.push({
                type: 'td',
                native: true,
                class: '_fc-ntf-btn fc-clock',
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
                    class: '_fc-ntf-table',
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
._fc-nested-table-form {
    overflow: auto;
    color: var(--fc-text-color-2);
}

._fc-nested-table-form .form-create .el-form-item {
    margin-bottom: 1px;
}

._fc-nested-table-form .form-create .el-form-item.is-error {
    margin-bottom: 22px;
}

._fc-nested-table-form .el-form-item__label, ._fc-nested-table-form .van-field__label {
    display: none !important;
}

._fc-nested-table-form .el-form-item__content {
    display: flex;
    margin-left: 0px !important;
    width: 100% !important;
}

._fc-ntf-table ._fc-ntf-head-idx, ._fc-ntf-table ._fc-ntf-idx {
    width: 40px;
    min-width: 40px;
    font-weight: 500;
    text-align: center;
    padding: 0;
}

._fc-ntf-idx div {
    display: inline-flex;
    justify-content: center;
    width: 18px;
    height: 18px;
    line-height: 16px;
    border: 1px solid #bfbfbf;
    border-radius: 6px;
    cursor: pointer;
}

._fc-ntf-sub-idx {
    width: 30px;
}

._fc-ntf-edit, ._fc-ntf-btn {
    width: 70px;
    min-width: 70px;
    text-align: center;
}

._fc-ntf-btn .fc-icon {
    cursor: pointer;
}

._fc-nested-table-form._fc-disabled ._fc-ntf-btn .fc-icon, ._fc-nested-table-form._fc-disabled > .el-button {
    cursor: not-allowed;
}

._fc-ntf-table {
    width: 100%;
    height: 100%;
    overflow: hidden;
    table-layout: fixed;
    border: 1px solid #EBEEF5;
    border-bottom: 0 none;
}

._fc-ntf-table > thead > tr > th {
    border: 0 none;
    border-bottom: 1px solid #EBEEF5;
    height: 40px;
    font-weight: 500;
}

._fc-ntf-table > thead > tr > th + th {
    border-left: 1px solid #EBEEF5;
}

._fc-ntf-table tr {
    min-height: 50px;
}

._fc-ntf-table ._fc-read-view {
    text-align: center;
    width: 100%;
}

._fc-ntf-table td {
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

._fc-ntf-table td + td {
    border-left: 1px solid #EBEEF5;
}

._fc-ntf-table .el-input-number, ._fc-ntf-table .el-select, ._fc-ntf-table .el-slider, ._fc-ntf-table .el-cascader, ._fc-ntf-table .el-date-editor {
    width: 100%;
}

._fc-nested-table-form ._fc-ntf-sub {
    background-color: #fafafa;
}

._fc-ntf-sub ._fc-table-form {
    background-color: var(--fc-bg-color-1);
}

._fc-ntf-sub ._fc-tf-table {
    border: 0 none;
}

/*._fc-ntf-sub ._fc-tf-table thead {
    background: #fafafa;
}*/

._fc-ntf-sub-idx + ._fc-ntf-head-idx, ._fc-ntf-idx + ._fc-ntf-idx {
    border-left: 0 none;
}

._fc-ntf-head-required:before {
    content: '*';
    color: #f56c6c;
    margin-right: 4px;
}
</style>
