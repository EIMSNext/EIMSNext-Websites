<template>
    <div class="_fd-table-column-config">
        <el-badge type="warning" is-dot :hidden="!configured">
            <el-button class="_fd-plain-button" plain @click="visible=true" size="small">
                {{ t('com.dataTable.column.btn') }}
            </el-button>
        </el-badge>
        <el-dialog class="_fd-tcc-dialog _fd-config-dialog" :title="t('com.dataTable.column.title')" v-model="visible"
                   destroy-on-close
                   :close-on-click-modal="false" append-to-body
                   width="980px">
            <template v-if="activeRow">
                <FnEditor ref="fn" v-model="activeRow.render" :args="['scope', 'h',' resolveComponent', 'api']"
                          name="render"></FnEditor>
            </template>
            <el-table v-show="!activeRow" :data="column" size="small" row-key="id" class="_fd-tcc-table">
                <el-table-column type="index" width="50"/>
                <el-table-column :label="t('com.dataTable.column.prop')" width="130">
                    <template #default="{row}">
                        <template v-if="!row.children || !row.children.length">
                            <el-input v-model="row.prop" v-if="!propColumns || !propColumns.length"></el-input>
                            <el-select v-model="row.prop" allow-create clearable default-first-option filterable
                                       v-else>
                                <template v-for="value in propColumns">
                                    <el-option :label="value" :value="value">{{ value }}</el-option>
                                </template>
                            </el-select>
                        </template>
                        <template v-else>
                            {{ t('com.dataTable.header') }}
                        </template>
                    </template>
                </el-table-column>
                <el-table-column width="100">
                    <template #default="{row}">
                        <el-input v-model="row.label"></el-input>
                    </template>
                    <template #header>
                        {{ t('props.title') }}<span style="color:red;">*</span>
                    </template>
                </el-table-column>
                <el-table-column :label="t('style.width')" width="100">
                    <template #default="{row}">
                        <el-input v-model="row.width" v-if="!row.children || !row.children.length"></el-input>
                    </template>
                </el-table-column>
                <el-table-column :label="t('com.dataTable.filter')" width="120">
                    <template #default="{row}">
                        <el-select v-model="row.filter" multiple v-if="!row.children || !row.children.length" clearable>
                            <template v-for="value in getColumnData(row.prop)">
                                <el-option :label="value" :value="value">{{ value }}</el-option>
                            </template>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="Class">
                    <template #default="{row}">
                        <el-input v-model="row.className"></el-input>
                    </template>
                </el-table-column>
                <el-table-column :label="t('com.dataTable.column.sort')" width="100">
                    <template #default="{row}">
                        <el-select v-model="row.sortable" v-if="!row.children || !row.children.length"  clearable>
                            <el-option v-for="opt in sortable"
                                       :label="opt.label"
                                       :value="opt.value"
                                       :key="opt.value"></el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column :label="t('props.position')" width="100">
                    <template #default="{row}">
                        <el-select v-model="row.fixed"  clearable>
                            <el-option v-for="opt in fixed"
                                       :label="opt.label"
                                       :value="opt.value"
                                       :key="opt.value || 'default'"></el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column :label="t('style.font.align')" width="100">
                    <template #default="{row}">
                        <el-select v-model="row.align" clearable>
                            <el-option v-for="opt in align"
                                       :label="opt.label"
                                       :value="opt.value"
                                       :key="opt.value"></el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column width="110">
                    <template #default="{row}">
                        <div class="flex">
                            <el-select v-model="row.format" clearable>
                                <el-option v-for="opt in format" :label="opt.label" :value="opt.value"
                                           :key="opt.value"></el-option>
                            </el-select>
                            <i class="fc-icon icon-edit" v-if="row.format === 'custom'" @click="editFn(row)"></i>
                        </div>
                    </template>
                    <template #header>
                        {{ t('props.render') }}<span style="color:red;">*</span>
                    </template>
                </el-table-column>
                <el-table-column :label="t('props.hide')" width="50" fixed="right">
                    <template #default="{row}">
                        <el-switch v-model="row.hidden" v-if="!row.children || !row.children.length"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column :label="t('tableOptions.handle')" width="90" fixed="right">
                    <template #default="{row, $index}">
                        <i class="fc-icon icon-add-circle" @click="add($index)"></i>
                        <i class="fc-icon icon-add-child" @click="addChild(row)"></i>
                        <i class="fc-icon icon-delete-circle" @click="remove(row)"></i>
                    </template>
                </el-table-column>
            </el-table>
            <el-button v-show="!activeRow" link type="primary" @click="add()">
                <i class="fc-icon icon-add-circle"></i>
                {{ t('tableOptions.add') }}
            </el-button>
            <template #footer>
                <div>
                    <el-button size="default" @click="close">{{ t('props.cancel') }}</el-button>
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
import {defineComponent} from 'vue';
import errorMessage from '../../utils/message';
import { deepCopy, hasProperty, uniqueId } from '@eimsnext/form-render-core';
import FnEditor from '../FnEditor.vue';

export default defineComponent({
    name: 'TableColumnConfig',
    components: {FnEditor},
    props: {
        modelValue: Array,
    },
    inject: ['designer'],
    data() {
        return {
            column: [],
            visible: false,
            activeRow: null,
        };
    },
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        configured() {
            return !!this.modelValue
        },
        list() {
            return (this.designer.setupState.activeRule?.__fc__.el.list) || [];
        },
        propColumns() {
            return Object.keys(this.list[0] || {});
        },
        format() {
            return ['default', 'tag', 'image', 'custom'].map(v => {
                return {label: this.t('com.dataTable.format.' + v), value: v};
            });
        },
        align() {
            return ['left', 'center', 'right'].map(v => {
                return {label: this.t('props.' + v), value: v};
            });
        },
        fixed() {
            return [false, 'left', 'right'].map(v => {
                return {label: this.t('com.dataTable.fixed.' + (v || 'default')), value: v};
            });
        },
        sortable() {
            return [false, true, 'custom'].map(v => {
                return {
                    label: this.t('com.dataTable.sortable.' + (typeof v === 'boolean' ? (v ? 'default' : 'disabled') : 'custom')),
                    value: v
                };
            });
        },
    },
    watch: {
        visible(v) {
            if (v) {
                this.tidyValue();
            } else {
                this.activeRow = null;
            }
        },
    },
    methods: {
        getColumnData(prop) {
            const data = [];
            if (!prop) {
                return data;
            }
            (this.list || []).forEach(v => {
                if (hasProperty(v, prop) && data.indexOf(v[prop]) === -1) {
                    data.push(v[prop]);
                }
            });
            return data;
        },
        add(idx) {
            const item = {format: 'default', filter: [], id: uniqueId()};
            idx != null ? this.column.splice(idx + 1, 0, item) : this.column.push(item);
        },
        addChild(column) {
            const item = {p: column, format: 'default', filter: [], id: uniqueId()};
            if (!column.children) {
                column.children = [];
            }
            column.children.push(item);
        },
        remove(column) {
            const columns = (column.p && column.p.children) || this.column;
            columns.splice(columns.indexOf(column), 1);
            if (column.p && !columns.length) {
                delete column.p.children;
            }
        },
        editFn(row) {
            this.activeRow = row;
        },
        updateFn() {
            this.activeRow = null;
        },
        tidyValue() {
            this.column = this.fullId(deepCopy(this.modelValue || []));
            if (!this.column.length) {
                this.add();
            }
        },
        fullId(columns, p) {
            columns.map(column => {
                if (!column.id) {
                    column.id = uniqueId();
                }
                column.p = p;
                if (column.children) {
                    this.fullId(column.children, column);
                }
            });
            return columns;
        },
        close() {
            if (this.activeRow) {
                this.activeRow = null;
            } else {
                this.visible = false;
            }
        },
        parseColumns(columns) {
            return columns.map(col => {
                const temp = {...col};
                delete temp.p;
                if (temp.children && temp.children.length > 0) {
                    temp.children = this.parseColumns(temp.children);
                } else {
                    delete temp.children;
                }
                return temp;
            })
        },
        submit() {
            if (this.activeRow) {
                if (this.$refs.fn.save()) {
                    this.activeRow = null;
                }
                return;
            }
            const value = [];
            const columns = this.parseColumns(this.column)
            for (let i = 0; i < columns.length; i++) {
                const col = columns[i];
                if (!col.label) {
                    errorMessage(this.t('com.dataTable.requiredLabel'));
                    return;
                }
                const temp = {...col};
                if (temp.label) {
                    if (!temp.children) {
                        if (temp.format !== 'custom') {
                            delete temp.render;
                        } else if (!temp.render) {
                            errorMessage(this.t('com.dataTable.requiredRender'));
                            return;
                        }
                    }
                    value.push(temp);
                }
            }
            this.$emit('update:modelValue', value);
            this.$emit('change', value);
            this.visible = false;
        },
    }
});
</script>

<style>
._fd-table-column-config, ._fd-table-column-config .el-badge {
    width: 100%;
}

._fd-table-column-config .el-button {
    font-weight: 400;
    width: 100%;
}

._fd-tcc-dialog .flex {
    display: flex;
    width: 100%;
}

._fd-tcc-dialog .el-dialog__body {
    height: 500px;
    overflow: auto;
}

._fd-tcc-dialog ._fd-fn {
    height: 100%;
}

._fd-tcc-table .fc-icon {
    cursor: pointer;
}

._fd-tcc-table .fc-icon + .fc-icon {
    margin-left: 4px;
}

._fd-tcc-table .cell {
    display: flex;
    flex-direction: row;
    align-items: center;
}

._fd-tcc-table .el-table__indent {
    padding-left: 8px !important;
}
</style>
