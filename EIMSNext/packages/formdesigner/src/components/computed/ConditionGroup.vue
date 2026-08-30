<template>
    <div class="fd-condition-list">
        <div class="fd-condition-header">
            <div class="fd-condition-title">
                <span>{{ t('comp.meetCondition') }}</span>
                <el-select v-if="list.length > 0" v-model="mode" size="small" class="fd-relation-select" @change="onInput">
                    <el-option label="AND" value="AND" />
                    <el-option label="OR" value="OR" />
                </el-select>
                <span>{{ t('comp.conditions') }}</span>
            </div>
            <i class="fc-icon icon-delete fd-delete" @click="$emit('remove', modelValue)" />
        </div>
        <div class="fd-condition-body">
            <template v-for="(item, idx) in list" :key="item.field + '-' + idx + '-' + list.length">
                <div v-if="item.mode != null" class="fd-condition-group">
                    <ConditionGroup v-model="list[idx]" :level="level + 1" @change="onInput" />
                    <i class="fc-icon icon-delete fd-group-delete" @click="removeItem(idx)" />
                </div>
                <div v-else class="fd-condition-row">
                    <el-select v-model="item.type" size="default" class="fd-type-select" @change="changeType(item)">
                        <el-option :label="t('props.field')" value="field" />
                        <el-option :label="t('props.variable')" value="variable" />
                    </el-select>
                    <template v-if="item.type === 'variable'">
                        <el-input v-model="item.field" class="fd-field-control" clearable @change="changeField(item)">
                            <template #suffix><VariableConfig popover @confirm="(val) => selectVar(item, val)" /></template>
                        </el-input>
                    </template>
                    <RuleSelect v-else v-model="item.field" class="fd-field-control" size="default" onlyField valueType="field" clearable :multiple="false" @change="changeField(item)" />
                    <el-select v-if="item.formula" v-model="item.condition" size="default" class="fd-operator-select" @change="onInput">
                        <el-option v-for="formula in item.formula" :key="formula.value" :label="formula.label" :value="formula.value" />
                    </el-select>
                    <div v-if="item.input && ['empty', 'notEmpty'].indexOf(item.condition) === -1" class="fd-value-control">
                        <RuleSelect v-if="item.var" v-model="item.compare" class="fd-value-input" size="default" onlyField valueType="field" clearable :multiple="false" @change="onInput" />
                        <ValueInput v-else-if="item.type === 'variable'" v-model="item.value" size="default" class="fd-value-input" @change="onInput" />
                        <PatternInput v-else-if="item.condition === 'pattern'" v-model="item.value" :key="item.field" class="fd-value-input" size="default" @change="onInput" />
                        <ConditionInput v-else v-model="item.value" v-bind="item.input" :key="item.field" class="fd-value-input" @change="onInput" />
                        <el-checkbox v-model="item.var" size="default" :label="t('props.field')" @change="onInput" />
                    </div>
                    <i class="fc-icon icon-delete fd-row-delete" @click="removeItem(idx)" />
                </div>
            </template>
        </div>
        <div class="fd-condition-actions">
            <el-button link type="primary" @click="addItem"><i class="fc-icon icon-add-circle" />{{ t('computed.addCondition') }}</el-button>
            <el-button v-if="level < maxLevel" link type="primary" @click="addItemGroup"><i class="fc-icon icon-add-circle" />{{ t('computed.addGroup') }}</el-button>
        </div>
    </div>
</template>

<script>
import {defineComponent, markRaw} from 'vue';
import ConditionInput from './ConditionInput.vue';
import { is } from '@eimsnext/form-render-core';
import {deepGet} from '../../utils';
import PatternInput from './PatternInput.vue';
import RuleSelect from '../RuleSelect.vue';
import ValueInput from './ValueInput.vue';
import VariableConfig from './VariableConfig.vue';

const formulaType = {
    input: ['==', '!=', 'on', 'notOn', 'empty', 'notEmpty', 'pattern'],
    select: ['==', '!=', 'on', 'notOn', 'empty', 'notEmpty'],
    switch: ['==', '!='],
    number: ['==', '!=', '>', '>=', '<', '<=', 'empty', 'notEmpty'],
};
formulaType.cascader = formulaType.select;

const ConditionGroup = defineComponent({
    name: 'ConditionGroup',
    components: {VariableConfig, ValueInput, RuleSelect, PatternInput, ConditionInput},
    inject: ['designer'],
    emits: ['update:modelValue', 'change'],
    props: {
        modelValue: [Object, Array],
        level: {
            type: Number,
            default: 1,
        },
    },
    computed: {
        formulaLabel() {
            return ['==', '!=', 'on', 'notOn', 'empty', 'notEmpty', 'pattern', '>', '>=', '<', '<='].reduce((p, v) => {
                p[v] = this.t('computed.formulas.' + v);
                return p;
            }, {});
        },
        activeRule() {
            return this.designer.setupState.activeRule;
        },
        rules() {
            let ctx = this.activeRule.__fc__.parent;
            let rules = [];
            while (ctx) {
                if (ctx.rule._menu && ctx.rule._menu.subForm) {
                    rules = this.getFields(this.designer.setupState.findTree(ctx.rule.field));
                    break;
                } else {
                    ctx = ctx.parent;
                }
            }
            return [...rules, ...this.getFields(this.designer.setupState.treeInfo)]
        },
        t() {
            return this.designer.setupState.t;
        },
    },
    data() {
        return {
            mode: 'AND',
            list: [],
            maxLevel: 3,
            ConditionGroup: markRaw(ConditionGroup),
        }
    },
    methods: {
        selectVar(item, val) {
            item.field = val.slice(2, -2);
            this.changeField(item);
        },
        addItem() {
            this.list.push({
                type: 'field',
            });
        },
        addItemGroup() {
            this.list.push({mode: 'AND'});
        },
        removeItem(idx) {
            this.list.splice(idx, 1);
            this.onInput();
        },
        changeType(item) {
            item.field = '';
            item.input = null;
            item.formula = null;
        },
        changeField(item) {
            if (item.field) {
                item.condition = '==';
                if (item.type === 'field') {
                    this.tidyItem(item);
                } else {
                    item.input = true;
                    item.formula = formulaType.select.map(v => {
                        return {
                            label: this.formulaLabel[v],
                            value: v
                        }
                    });
                }
            } else {
                item.input = null;
                item.formula = null;
            }
            this.onInput();
        },
        getFields(children, parent = []) {
            const fields = [];
            children.forEach(({rule, children}) => {
                const temp = [...parent];
                if (rule.field) {
                    temp.push(rule);
                }
                const childrenFields = this.getFields(children || [], temp);
                if (rule.field) {
                    const item = {
                        field: rule.field,
                        value: parent.length ? parent.map(item => item.field).join('.') + '.' + rule.field : rule.field,
                        label: rule.title,
                        rule,
                    };
                    fields.push(item, ...childrenFields);
                } else {
                    fields.push(...childrenFields)
                }

            });
            return fields;
        },
        tidyValue() {
            let value = this.modelValue;
            if (value) {
                if (Array.isArray(value)) {
                    value = {
                        mode: 'AND',
                        group: value
                    }
                }
                this.mode = value.mode === 'OR' ? 'OR' : 'AND';
                this.list = (value.group || []).map(item => {
                    if (item.mode != null) {
                        return item;
                    } else {
                        return this.tidyItem({...item});
                    }
                });
            }
            if (!this.list.length) {
                this.list.push({type: 'field'});
            }
        },
        tidyItem(item) {
            if (item.variable) {
                item.input = true;
                item.field = item.variable;
                item.formula = formulaType.select.map(v => {
                    return {
                        label: this.formulaLabel[v],
                        value: v
                    }
                });
                item.type = 'variable';
                return item;
            }
            item.type = 'field';
            this.rules.forEach(data => {
                if (data.value === item.field || data.field === item.field) {
                    const condition = data.rule._menu.condition;
                    const input = condition ? (is.Function(condition) ? condition(data.rule) : is.String(condition) ? {
                        type: condition
                    } : {...condition}) : {
                        type: 'input'
                    }
                    if (input.options) {
                        input.options = is.String(input.options) ? deepGet(data.rule.__fc__.prop, input.options) : input.options;
                    }
                    item.formula = (formulaType[input.type] || formulaType.input).map(v => {
                        return {
                            label: this.formulaLabel[v],
                            value: v
                        }
                    });
                    item.var = !!item.compare;
                    item.input = input;
                }
            });

            return item;
        },
        onInput() {
            let value = []
            this.list.forEach(item => {
                if (item.field && item.condition && (item.compare || ['empty', 'notEmpty'].indexOf(item.condition) > -1 || (item.value != null && item.value !== ''))) {
                    const val = {
                        [item.type]: item.field,
                        condition: item.condition,
                    };
                    if (item.compare && item.var) {
                        val.compare = item.compare;
                    } else {
                        val.value = item.value;
                    }
                    value.push(val);
                } else if (item.group) {
                    value.push(item);
                }
            });
            if (value.length === 1 && value[0].mode != null) {
                value = value[0];
            } else {
                value = value.length > 0 ? {
                    mode: this.mode,
                    group: value
                } : undefined
            }
            if (!value && (!this.modelValue || !this.modelValue.group)) {
                return;
            }
            this.$emit('update:modelValue', value);
            this.$emit('change', value);
        },
    },
    created() {
        this.tidyValue();
    }

});

export default ConditionGroup;
</script>

<style>
.fd-condition-list {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--fc-line-color-3);
    border-radius: 6px;
    background: var(--fc-bg-color-2);
}

.fd-condition-header {
    min-height: 36px;
    padding: 0 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--fc-bg-color-3);
}

.fd-condition-title {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--fc-text-color-1);
    font-size: 14px;
}

.fd-relation-select {
    width: 65px;
}

.fd-delete,
.fd-row-delete,
.fd-group-delete {
    cursor: pointer;
    color: var(--fc-text-color-2);
}

.fd-condition-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
}

.fd-condition-row {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 38px;
    padding: 10px;
    border: 1px dashed var(--fc-line-color-3);
    border-radius: 3px;
    background: var(--fc-bg-color-1);
}

.fd-type-select { width: 85px; flex: 0 0 85px; }
.fd-field-control { width: 208px; flex: 0 1 208px; }
.fd-operator-select { width: 104px; flex: 0 0 104px; }
.fd-value-control { display: flex; align-items: center; gap: 10px; flex: 1 1 208px; min-width: 0; }
.fd-value-input { flex: 1 1 0; min-width: 120px; }

.fd-condition-group {
    position: relative;
    margin-left: 30px;
    padding: 10px;
    border: 1px dashed var(--fc-line-color-3);
    border-radius: 3px;
}

.fd-group-delete {
    position: absolute;
    top: 4px;
    right: 4px;
}

.fd-condition-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 10px 10px 25px;
}

.fd-condition-actions .el-button {
    color: var(--fc-style-color-1);
}

@media (max-width: 700px) {
    .fd-condition-row { flex-wrap: wrap; }
    .fd-field-control { flex-basis: calc(100% - 95px); }
    .fd-value-control { flex-basis: 100%; }
}
</style>
