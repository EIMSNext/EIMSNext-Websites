<template>
    <div class="_fd-tree-opt">
        <el-tree
            :data="value"
            node-key="index"
            :key="checked ? '1' : '2'"
            :indent="5"
            :expand-on-click-node="false">
            <template #default="{ node, data }">
                <div class="_fd-tree-opt-node">
                    <template v-if="!checked">
                        <el-input class="_fd-tree-opt-first" v-model="data[overColumns.label]"
                                  @blur="change"/>
                        <ValueInput class="_fd-tree-opt-last" v-model="data[overColumns.value]" @blur="change"
                                    @change-type="change">
                            <template #append>
                                <div class="_fd-tree-opt-btn" @click="add(node, data)">
                                    <i class="fc-icon icon-add"></i>
                                </div>
                                <div class="_fd-tree-opt-btn" @click="append(data)">
                                    <i class="fc-icon icon-add-child"></i>
                                </div>
                                <div class="_fd-tree-opt-btn _fd-tree-opt-danger" @click="remove(node, data)">
                                    <i class="fc-icon icon-delete"></i>
                                </div>
                            </template>
                        </ValueInput>
                    </template>
                    <template v-else>
                        <el-input class="_fd-tree-opt-last _label" v-model="data[keyValue]" @blur="change">
                            <template #append>
                                <div class="_fd-tree-opt-btn" @click="add(node, data)">
                                    <i class="fc-icon icon-add"></i>
                                </div>
                                <div class="_fd-tree-opt-btn" @click="append(data)">
                                    <i class="fc-icon icon-add-child"></i>
                                </div>
                                <div class="_fd-tree-opt-btn _fd-tree-opt-danger" @click="remove(node, data)">
                                    <i class="fc-icon icon-delete"></i>
                                </div>
                            </template>
                        </el-input>
                    </template>
                </div>
            </template>
        </el-tree>
        <el-checkbox v-if="keyValue" v-model="checked" :label="t('tableOptions.keyValue')"/>
    </div>

</template>

<script>

import {defineComponent} from 'vue';
import {deepCopy} from '@eimsnext/form-render-core';
import ValueInput from './computed/ValueInput.vue';

export default defineComponent({
    name: 'TreeOptions',
    components: {ValueInput},
    emits: ['update:modelValue'],
    props: {
        modelValue: Array,
        columns: Object,
        keyValue: String,
    },
    inject: ['designer'],
    data() {
        return {
            value: [...deepCopy(this.modelValue || [])],
            checked: false,
        };
    },
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        overColumns() {
            if (!this.columns) {
                return {
                    label: 'label',
                    value: 'value',
                };
            }
            return {
                label: this.columns.label || 'label',
                value: this.columns.value || 'value',
            }
        }
    },
    created() {
        if (!this.value.length) {
            this.value = [{}]
        }
        if (this.keyValue) {
            this.checked = this.isChecked();
            this.$watch('checked', (n) => {
                n && this.change();
            });
        }
    },
    methods: {
        isChecked() {
            const deepCheck = (list) => {
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    if (item[this.overColumns.label] !== item[this.overColumns.value]) {
                        return false;
                    }
                    if (item.children && !deepCheck(item.children)) {
                        return false;
                    }
                }
                return true;
            }
            return deepCheck(this.modelValue || []);
        },
        tidyValue() {
            const deepTidy = (list) => {
                let tmp = [];
                list.map(v => {
                    const val = v[this.keyValue];
                    const item = {
                        [this.overColumns.label]: val,
                        [this.overColumns.value]: val,
                    };
                    tmp.push(item)
                    if (v.children) {
                        item.children = deepTidy(v.children);
                    }
                });
                return tmp;
            }
            if (this.checked && this.keyValue) {
                return deepTidy(this.value);
            } else {
                return deepCopy(this.value);
            }
        },
        change() {
            this.$emit('update:modelValue', this.tidyValue());
        },
        add(node) {
            const parent = node.parent;
            const children = parent.data.children || parent.data;
            children.push({});
        },
        append(data) {
            if (!data.children) {
                data.children = [];
            }
            data.children.push({});
        },
        remove(node, data) {
            const parent = node.parent;
            if (parent.data.children) {
                parent.data.children.splice(parent.data.children.indexOf(data), 1);
                if (!parent.data.children.length) {
                    delete parent.data.children;
                }
            } else {
                parent.data.splice(parent.data.indexOf(data), 1);
            }
            this.change();
        },
    }
});
</script>

<style>
._fd-tree-opt ._fd-tree-opt-btn {
    height: 19px;
    width: 18px;
    color: #fff;
    text-align: center;
    line-height: 20px;
    padding-bottom: 1px;
    float: left;
    cursor: pointer;
    justify-content: center;
    background-color: var(--fc-style-color-1);
}

._fd-tree-opt-node {
    display: flex;
    align-items: center;
}

._fd-tree-opt-first {
    width: 60px;
    margin-right: 5px;
}

._fd-tree-opt-last {
    width: 165px;
}

._fd-tree-opt-last._label {
    width: 175px;
}

._fd-tree-opt-last._label .el-input-group__append {
    width: 65px;
}

._fd-tree-opt ._fd-tree-opt-danger {
    background-color: var(--fc-style-color-3);
    border-radius: 0 2px 2px 0;
}

._fd-tree-opt .el-tree-node__content {
    margin-bottom: 3px;
    height: 28px;
}

._fd-tree-opt .el-input__inner {
    border-right: 0 none;
}

._fd-tree-opt .el-input-group__append {
    width: 90px;
    padding-right: 2px;
    padding-left: 1px;
    background: var(--fc-bg-color-1);
}
</style>
