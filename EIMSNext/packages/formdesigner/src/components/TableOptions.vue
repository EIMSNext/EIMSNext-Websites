<template>
    <div class="_td-table-opt">
        <el-table :data="value" :key="checked ? '2' : '1'" border :size="size || 'small'" style="width: 100%" :show-header="showHeader">
            <template v-for="(col, idx) in overColumn" :key="col.label + idx">
                <el-table-column :label="col.label">
                    <template #default="scope">
                        <template v-if="col.value">
                            <ValueInput :size="size || 'small'" :modelValue="scope.row[col.key]"
                                @update:modelValue="(n) => (scope.row[col.key] = n)" @blur="onInput(scope.row)"
                                @change-type="onInput(scope.row)"></ValueInput>
                        </template>
                        <template v-else>
                            <el-input :size="size || 'small'" :modelValue="scope.row[col.key]"
                                @update:modelValue="(n) => (scope.row[col.key] = n)"
                                @blur="onInput(scope.row)"></el-input>
                        </template>
                    </template>
                </el-table-column>
            </template>
            <el-table-column width="35" align="center" fixed="right">
                <template #default="scope">
                    <i class="fc-icon icon-delete" @click="del(scope.$index)"></i>
                </template>
            </el-table-column>
        </el-table>
        <div class="_td-table-opt-handle">
            <el-button link type="primary" @click="add" v-if="!max || max > value.length">
                <i class="fc-icon icon-add"></i> {{ t('tableOptions.add') }}
            </el-button>
            <!-- 隐藏keyvalue选项，设置默认值为true -->
            <!-- <el-checkbox v-model="checked" :label="t('tableOptions.keyValue')" v-if="keyValue" /> -->
        </div>

    </div>
</template>

<script>
import { defineComponent } from 'vue';
import { copy } from '@eimsnext/form-render-core';
import ValueInput from './computed/ValueInput.vue';

export default defineComponent({
    name: 'TableOptions',
    components: { ValueInput },
    emits: ['update:modelValue', 'change'],
    props: {
        modelValue: [Array, Object],
        column: {
            type: Array,
            default: () => [{ label: 'label', key: 'label' }, { label: 'value', key: 'value' }]
        },
        valueType: String,
        keyValue: String,
        max: Number,
        size: String,
        showHeader: {
            type: Boolean,
            default: true
        }
    },
    inject: ['designer'],
    watch: {
        modelValue() {
            this.value = this.tidyModelValue();
        }
    },
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        overColumn() {
            let column = this.column;
            if (this.checked) {
                for (let i = 0; i < column.length; i++) {
                    if (column[i].key === this.keyValue) {
                        return [column[i]];
                    }
                }
            }
            return column;
        },
    },
    data() {
        return {
            value: this.tidyModelValue(),
            checked: true //false
        };
    },
    created() {
        if (this.keyValue) {
            this.checked = this.isChecked();
            this.$watch('checked', (n) => {
                n && this.input();
            });
        }
    },
    methods: {
        isChecked() {
            for (let i = 0; i < this.value.length; i++) {
                const item = this.value[i];
                const keys = Object.keys(item);
                const value = item[this.keyValue];
                for (let i = 0; i < keys.length; i++) {
                    if (value !== item[keys[i]]) {
                        return false;
                    }
                }
            }
            return true;
        },
        tidyModelValue() {
            const modelValue = this.modelValue;
            if (this.valueType === 'string') {
                return (modelValue || []).map(value => {
                    return { value: '' + value }
                })
            } else if (this.valueType === 'object') {
                return Object.keys((modelValue || {})).map(label => {
                    return { label, value: modelValue[label] }
                })
            } else {
                return [...modelValue || []].map(v => {
                    return copy(v);
                });
            }
        },
        tidyValue() {
            if (this.valueType === 'object') {
                const obj = {};
                this.value.forEach(v => {
                    if (v.label && v.value) {
                        obj[v.label] = v.value;
                    }
                })
                return obj;
            } else {
                return this.value.map(v => {
                    if (this.valueType === 'string') {
                        return v.value;
                    }
                    if (this.checked) {
                        const value = v[this.keyValue];
                        return this.column.reduce((item, col) => {
                            item[col.key] = value;
                            return item;
                        }, {});
                    } else {
                        return { ...v }
                    }
                });
            }
        },
        onInput(item) {
            if (this.column.length === 1 && '' === item[this.column[0].key]) {
                return;
            }
            const flag = this.column.every(v => {
                if (v.required === false) {
                    return true;
                }
                if (['object', 'string'].indexOf(this.valueType) > -1) {
                    return item[v.key] !== undefined && item[v.key] !== '' && item[v.key] !== null;
                }
                return item[v.key] !== undefined;
            })
            if (flag) {
                this.input();
            }
        },
        input() {
            const value = this.tidyValue();
            this.$emit('update:modelValue', value);
            this.$emit('change', value);
        },
        add() {
            this.value.push(this.column.reduce((initial, v) => {
                const i = this.value.length + 1
                initial[v.key] = this.t("props.option") + (i < 10 ? `0${i}` : `${i}`);
                return initial;
            }, {}));
            this.input()
        },
        del(idx) {
            this.value.splice(idx, 1);
            this.input();
        }
    }
});
</script>

<style>
._td-table-opt {
    width: 100%;
}

._td-table-opt .icon-delete {
    cursor: pointer;
}

._td-table-opt .el-table {
    z-index: 1;
}

._td-table-opt-handle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 5px;
}
</style>
