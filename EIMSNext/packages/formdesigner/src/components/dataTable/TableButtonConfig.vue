<template>
    <div class="_fd-table-button-config">
        <el-badge type="warning" is-dot :hidden="!configured">
            <el-button class="_fd-plain-button" plain @click="visible=true" size="small">{{ t('com.dataTable.button.btn') }}</el-button>
        </el-badge>
        <el-dialog class="_fd-tcb-dialog _fd-config-dialog" :title="t('com.dataTable.button.title')" v-model="visible" destroy-on-close
                   :close-on-click-modal="false" append-to-body
                   width="980px">
            <template v-if="activeRow">
                <FnEditor ref="fn" v-model="activeRow[activeKey]" :args="activeArgs"
                          :name="activeKey"></FnEditor>
            </template>
            <template v-else>
                <el-table :data="column" size="small">
                    <el-table-column type="index" width="50"/>
                    <el-table-column :label="t('props.preview')" width="100">
                        <template #default="{row}">
                            <el-button v-bind="btnProps(row)">{{ row.name }}</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column width="100">
                        <template #default="{row}">
                            <el-input v-model="row.key"></el-input>
                        </template>
                        <template #header>
                            ID<span style="color:red;">*</span>
                        </template>
                    </el-table-column>
                    <el-table-column>
                        <template #default="{row}">
                            <el-input v-model="row.name"></el-input>
                        </template>
                        <template #header>
                            {{ t('props.name') }}<span style="color:red;">*</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('event.type')" width="120">
                        <template #default="{row}">
                            <el-select v-model="row.type">
                                <el-option v-for="opt in type"
                                           :label="opt.label"
                                           :value="opt.value"
                                           :key="opt.value"></el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('style.font.size')" width="120">
                        <template #default="{row}">
                            <el-select v-model="row.size">
                                <el-option v-for="opt in size"
                                           :label="opt.label"
                                           :value="opt.value"
                                           :key="opt.value"></el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('style.decoration.name')" width="120">
                        <template #default="{row}">
                            <el-select multiple v-model="row.prop">
                                <el-option v-for="opt in decoration"
                                           :label="opt.label"
                                           :value="opt.value"
                                           :key="opt.value"></el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('props.hide')" width="80">
                        <template #default="{row}">
                            <el-switch v-model="row.hidden"></el-switch>
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('props.callback')" width="80">
                        <template #default="{row}">
                            <div class="_fd-tcb-btn" @click="handle(row, 'handle', ['props', 'scope', 'api'])">{{ t('com.dataTable.handle') }}<i class="fc-icon icon-edit"></i>
                            </div>
                            <div class="_fd-tcb-btn" @click="handle(row, 'click', ['scope', 'api'])">{{ t('com.dataTable.click') }}<i class="fc-icon icon-edit"></i>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('tableOptions.handle')" width="80">
                        <template #default="{$index}">
                            <i class="fc-icon icon-add-circle" @click="add($index)"></i>
                            <i class="fc-icon icon-delete-circle" @click="remove($index)"></i>
                        </template>
                    </el-table-column>
                </el-table>
                <el-button link type="primary" @click="add()">
                    <i class="fc-icon icon-add-circle"></i>
                    {{ t('tableOptions.add') }}
                </el-button>
            </template>
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
import {deepCopy} from '@eimsnext/form-render-core';


export default defineComponent({
    name: 'TableColumnConfig',
    props: {
        modelValue: Array,
    },
    inject: ['designer'],
    data() {
        return {
            column: [],
            visible: false,
            activeRow: null,
            activeKey: '',
            activeArgs: [],
        };
    },
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        configured() {
            return !!this.modelValue
        },
        decoration() {
            return ['link', 'round', 'plain', 'disabled'].map(v => {
                return {label: this.t('com.dataTable.button.' + v), value: v};
            });
        },
        size() {
            return ['large', 'default', 'small'].map(v => {
                return {label: this.t('props.' + v), value: v};
            });
        },
        type() {
            return ['primary', 'success', 'warning', 'danger', 'info'].map(v => {
                return {label: this.t('props.' + v), value: v};
            })
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
        btnProps(row) {
            const prop = row.prop || [];
            return {
                type: row.type,
                size: row.size,
                round: prop.indexOf('round') > -1,
                link: prop.indexOf('link') > -1,
                plain: prop.indexOf('plain') > -1,
                disabled: prop.indexOf('disabled') > -1,
            }
        },
        defaultData() {
            return {
                key: this.column.length + 1,
                name: this.t('props.button') + (this.column.length + 1)
            }
        },
        add(idx) {
            idx != null ? this.column.splice(idx + 1, 0, this.defaultData()) : this.column.push(this.defaultData());
        },
        handle(rule, key, args) {
            this.activeKey = key;
            this.activeRow = rule;
            this.activeArgs = args;
        },
        remove(idx) {
            this.column.splice(idx, 1);
        },
        tidyValue() {
            this.column = deepCopy(this.modelValue || []);
            if (!this.column.length) {
                this.add();
            }
        },
        close() {
            if (this.activeRow) {
                this.activeRow = null;
            } else {
                this.visible = false;
            }
        },
        submit() {
            if (this.activeRow) {
                if (this.$refs.fn.save()) {
                    this.activeRow = null;
                }
                return;
            }
            const value = [];
            for (let i = 0; i < this.column.length; i++) {
                const col = this.column[i];
                if (!col.name) {
                    errorMessage(this.t('com.dataTable.requiredName'));
                    return;
                }
                if (!col.key) {
                    errorMessage(this.t('com.dataTable.requiredKey'));
                    return;
                }
                value.push({...col});
            }
            this.$emit('update:modelValue', value);
            this.$emit('change', value);
            this.visible = false;
        },
    }
});
</script>

<style>
._fd-table-button-config, ._fd-table-button-config .el-badge {
    width: 100%;
}

._fd-table-button-config .el-button {
    font-weight: 400;
    width: 100%;
}

._fd-tcb-dialog .el-dialog__body {
    height: 500px;
    overflow: auto;
}

._fd-tcb-btn{
    display: flex;
    cursor: pointer;
}

</style>
