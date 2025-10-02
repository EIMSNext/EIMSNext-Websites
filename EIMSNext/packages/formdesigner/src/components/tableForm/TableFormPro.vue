<template>
    <div class="_fc-table-form-v2" :class="{'_fc-disabled': disabled}">
        <component :is="Form" :option="options" :rule="rule" :extendOption="true"
                   :disabled="disabled"
                   @change="formChange"
                   v-model:api="fapi"
                   @emit-event="$emit"></component>
        <div class="_fc-tf-pro-handle">
            <div>
                <el-button link type="primary" class="fc-clock" v-if="(!max || max > total) && addable !== false"
                           @click="addRaw(true)"><i class="fc-icon icon-add-circle" style="font-weight: 700;"></i>
                    {{ formCreateInject.t('add') || '添加' }}
                </el-button>
            </div>
            <el-pagination v-bind="page.props || {}" layout="prev, pager, next" :currentPage="nowPage"
                           @update:currentPage="changePage"
                           :total="total" :pageSize="limit"
                           v-if="page && page.open === true && chunk.length > 1"></el-pagination>
        </div>
    </div>
</template>

<script>
import {markRaw, reactive, h, resolveComponent} from 'vue';
import { parseFn,extend,deepCopy } from "@eimsnext/form-render-core";

export default {
    name: 'TableFormPro',
    emits: ['change', 'add', 'delete', 'update:modelValue', 'handleClick'],
    props: {
        formCreateInject: Object,
        height: [String, Number],
        modelValue: {
            type: Array,
            default: () => [],
        },
        columns: {
            type: Array,
            required: true,
            default: () => []
        },
        button: Object,
        page: Object,
        size: String,
        filterEmptyColumn: {
            type: Boolean,
            default: true,
        },
        newColumn: Boolean,
        deletable: {
            type: Boolean,
            default: true,
        },
        addable: {
            type: Boolean,
            default: true,
        },
        options: {
            type: Object,
            default: () => reactive(({
                submitBtn: false,
                resetBtn: false,
            }))
        },
        showIndex: Boolean,
        max: Number,
        disabled: Boolean,
    },
    watch: {
        modelValue: {
            handler() {
                const str = JSON.stringify(this.modelValue || []);
                if (this.oldValue === str) {
                    return;
                }
                this.chunk = [[]];
                this.nowPage = 1;
                this.updateTable();
                this.oldValue = str;
            },
        },
    },
    computed: {
        total() {
            return this.chunk.reduce((acc, curr) => {
                acc += curr.length;
                return acc;
            }, 0);
        },
        limit() {
            return (!this.page || this.page.open !== true) ? 1000000 : ((this.page.props && this.page.props.pageSize) || 20);
        },
        pageData() {
            return this.chunk[this.nowPage - 1];
        },
    },
    data() {
        return {
            chunk: [[]],
            data: [],
            rule: [],
            trs: [],
            fapi: {},
            key: 1,
            Form: markRaw(this.formCreateInject.form.$form()),
            copyTrs: '',
            oldValue: '',
            nowPage: 1,
            indexRule: {
                type: 'el-table-column',
                props: {
                    label: '#',
                    type: 'index',
                    fixed: 'left',
                }
            },
        };
    },
    methods: {
        paginateArray() {
            const array = this.modelValue || [];
            const pageSize = this.limit;
            const result = [];

            for (let i = 0; i < array.length; i += pageSize) {
                const page = array.slice(i, i + pageSize);
                result.push(page);
            }
            result.length && result.forEach((item, idx) => {
                this.chunk[idx] = [...(this.chunk[idx] || []), ...item];
            })
            if (this.nowPage > this.chunk.length) {
                this.nowPage = this.chunk.length;
            }
        },
        formChange() {
            this.updateValue();
        },
        updateValue() {
            this.trs.forEach((tr, idx) => {
                extend(this.pageData[idx], this.fapi.getChildrenFormData(tr));
            });
            const value = deepCopy(this.chunk.reduce((acc, curr) => {
                return [...acc, ...curr];
            }, []).filter(v => {
                if (!this.filterEmptyColumn) {
                    return true;
                }
                if (v === undefined || v === null) {
                    return false;
                }
                let flag = false;
                Object.keys(v).forEach(k => {
                    flag = flag || (v[k] !== undefined && v[k] !== '' && v[k] !== null)
                })
                return flag;
            }));
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
        changePage(val) {
            if (val === this.nowPage) {
                return;
            }
            this.chunk[this.nowPage - 1] = this.pageData;
            this.nowPage = val;
            this.rule[1].props.data = this.pageData;
            this.trs.splice(0, this.trs.length);
            this.pageData.forEach((data, idx) => {
                if (!this.trs[idx]) {
                    this.addRaw();
                }
                this.setRawData(idx, data || {});
            });
            this.rule[0].children = this.trs;
        },
        updateTable() {
            this.paginateArray();
            this.rule[1].props.data = this.pageData;
            this.trs.splice(0, this.trs.length);
            this.pageData.forEach((data, idx) => {
                if (!this.trs[idx]) {
                    this.addRaw();
                }
                this.setRawData(idx, data || {});
            });
            this.rule[0].children = this.trs;
        },
        delRaw(idx) {
            if (this.disabled || this.deletable === false) {
                return;
            }
            this.trs.splice(idx, 1);
            this.rule[1].props.data.splice(idx, 1);
            this.updateValue();
            this.$emit('delete', idx);
            this.oldValue = '';
        },
        addRaw(flag) {
            if (flag && (this.disabled || this.addable === false)) {
                return;
            }
            if (!flag) {
                const tr = this.formCreateInject.form.parseJson(this.copy);
                this.trs.push(tr);
                return;
            }
            if (this.chunk[this.chunk.length - 1].length >= this.limit) {
                this.chunk.push([{}]);
            } else {
                if (flag) {
                    this.chunk[this.chunk.length - 1].push({});
                }
                if (flag && this.nowPage === this.chunk.length) {
                    const tr = this.formCreateInject.form.parseJson(this.copy);
                    this.trs.push(tr);
                }
            }
            if (flag) {
                this.$emit('add', this.total);
                this.updateValue();
            }
        },
        btnProps(btn, scope) {
            const _scope = {...scope};
            _scope.row = this.modelValue[scope.$index] || {};
            const prop = btn.prop || [];
            const props = {
                type: btn.type,
                size: btn.size,
                round: prop.indexOf('round') > -1,
                link: prop.indexOf('link') > -1,
                plain: prop.indexOf('plain') > -1,
                disabled: prop.indexOf('disabled') > -1 || this.disabled || (btn.key === 'delete' && this.deletable === false),
                onClick: (evt) => {
                    _scope.row = this.modelValue[scope.$index] || {};
                    evt.stopPropagation();
                    if (btn.key === 'delete') {
                        this.delRaw(scope.$index);
                        return;
                    }
                    const fn = parseFn(btn.click);
                    try {
                        fn && fn(_scope, this.formCreateInject.api);
                    } catch (e) {
                        console.error(e);
                    }
                    this.$emit('handleClick', {name: btn.name, key: btn.key, _scope, column: _scope.row});
                }
            }
            try {
                if (!this.disabled) {
                    const fn = parseFn(btn.handle);
                    const res = fn && fn(props, _scope, this.formCreateInject.api);
                    if (typeof res === 'boolean') {
                        props.disabled = res;
                    }
                }
            } catch (e) {
                console.error(e);
            }

            return props;
        },
        loadRule() {
            this.copy = this.formCreateInject.form.toJson({
                type: 'template',
                name: 'template',
                subRule: true,
                children: this.columns.map((column) => {
                    return {
                        type: 'template',
                        children: [...(column.rule || [])]
                    }
                })
            });
            this.rule = [
                {
                    type: 'hidden',
                    children: this.trs,
                },
                {
                    type: 'elTable',
                    style: {
                        width: '100%',
                    },
                    key: this.key,
                    props: {
                        ...this.$attrs,
                        height: this.height,
                        size: this.size,
                        data: [],
                    },
                    children: []
                }
            ]
        },
    },
    created() {
        this.loadRule();
    },
    mounted() {
        this.updateTable();
        if (this.newColumn && (!this.modelValue || !this.modelValue.length)) {
            this.addRaw(true);
        }
        this.$watch(() => [...this.columns], (n) => {
            const columns = this.columns.filter(column => column.hidden !== true).map((column, idx) => {
                return {
                    type: 'el-table-column',
                    _tableColumn: true,
                    _header: column.header,
                    props: {
                        fixed: column.fixed || false,
                        width: column?.style?.width || 'auto',
                        minWidth: 120
                    },
                    renderSlots: {
                        header() {
                            return h('span', {
                                class: column.required ? 'is-required' : '',
                                style: {color: column?.style?.color}
                            }, column.label)
                        },
                        default: ({$index}) => {
                            const rule = this.rule[0]?.children[$index]?.children[idx];
                            if (!rule) {
                                return;
                            }
                            return this.fapi.renderRule(rule, undefined, true)?.default?.();
                        }
                    }
                }
            });
            const headers = [];
            columns.forEach((column) => {
                if (column._header) {
                    let flag = false;
                    headers.forEach(item => {
                        if (item._tableColumn === column._header) {
                            if (column.props.fixed && !item.props.fixed) {
                                item.props.fixed = column.props.fixed;
                            }
                            item.children.push(column);
                            flag = true;
                        }
                    })
                    if (!flag) {
                        headers.push({
                            type: 'el-table-column',
                            _tableColumn: column._header,
                            props: {
                                label: column._header
                            },
                            children: [column]
                        });
                    }
                } else {
                    headers.push(column);
                }
            });
            let start = null;
            let len = 0;
            this.rule[1].children.forEach((item, idx) => {
                if (item._tableColumn) {
                    if (start === null) {
                        start = idx;
                    }
                    len++;
                }
            });
            if (start !== null) {
                this.rule[1].children.splice(start, len);
            }
            this.rule[1].children.splice(this.rule[1].children.indexOf(this.indexRule) > -1 ? 1 : 0, 0, ...headers);
            this.key++;
        }, {immediate: true})
        this.$watch(() => this.showIndex, (n) => {
            if (n === false && this.rule[1].children.indexOf(this.indexRule) > -1) {
                this.rule[1].children.splice(0, 1);
            } else if (n !== false && this.rule[1].children.indexOf(this.indexRule) === -1) {
                this.rule[1].children.unshift(this.indexRule);
            }
        }, {immediate: true})
        this.$watch(() => this.formCreateInject.preview && this.button && this.button.column && [{...this.button}, ...this.button.column], (n) => {
            this.rule[1].children.forEach((item, idx) => {
                if (item._tableHandle) {
                    this.rule[1].children.splice(idx, 1);
                }
            })
            if (!this.formCreateInject.preview && this.button.show !== false) {
                this.rule[1].children.push({
                    type: 'el-table-column',
                    _tableHandle: true,
                    props: {
                        label: this.button.label || this.formCreateInject.t('operation') || '操作',
                        fixed: this.button.fixed === undefined ? 'right' : this.button.fixed,
                        width: this.button.width || '100px',
                    },
                    renderSlots: {
                        default: (scope) => {
                            return this.button.column.filter(btn => btn.hidden !== true).map(btn => {
                                return h(resolveComponent('el-button'), this.btnProps(btn, scope), () => [btn.key === 'delete' ? (this.formCreateInject.t('delete') || btn.name) : btn.name]);
                            });
                        }
                    }
                })
            }
        }, {immediate: true})
    }
};
</script>

<style>
._fc-table-form-v2 {
    overflow: auto;
    color: var(--fc-text-color-2);
    width: 100%;
}

._fc-table-form-v2 .is-required:before {
    content: '*';
    color: #f56c6c;
    margin-right: 4px;
}

._fc-table-form-v2 .form-create td .el-form-item {
    margin-bottom: 1px;
}

._fc-table-form-v2 .form-create td .el-form-item.is-error {
    margin-bottom: 22px;
}

._fc-table-form-v2 .el-form-item__content {
    display: flex;
    margin-left: 0px !important;
    width: 100% !important;
}

._fc-table-form-v2 .el-form-item__label {
    display: none !important;
}

._fc-tf-pro-handle {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
    margin-top: 12px;
}

._fc-table-form-v2 .el-input-number, ._fc-table-form-v2 .el-select, ._fc-table-form-v2 .el-slider, ._fc-table-form-v2 .el-cascader, ._fc-table-form-v2 .el-date-editor {
    width: 100%;
}
</style>
