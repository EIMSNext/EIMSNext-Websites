<template>
    <div class="_fd-cdg-input">
        <div class="_fd-cdg-item">
            <div class="_fd-cdg-and">
                <el-select size="default" v-model="mode" @change="onInput" v-if="list.length > 0">
                    <el-option label="AND" value="AND"/>
                    <el-option label="OR" value="OR"/>
                </el-select>
            </div>
            <div class="_fd-cdg-options">
                <template v-for="(item, idx) in list">
                    <div class="_fd-cdg-option is-group" v-if="item.mode != null" :key="item.field + 'a' + idx + list.length">
                        <ConditionGroup v-model="list[idx]" @change="onInput"></ConditionGroup>
                        <i class="fc-icon icon-add-circle" :class="{disabled: list.length === 1}"
                           @click="removeItem(idx)"></i>
                    </div>
                    <div class="_fd-cdg-option" v-else :key="idx">
                        <el-select style="width: 85px;" size="default" v-model="item.type"
                                   @change="changeType(item)">
                            <el-option :label="t('props.field')" value="field"/>
                            <el-option :label="t('props.variable')" value="variable"/>
                        </el-select>
                        <template v-if="item.type === 'variable'">
                            <el-input class="_fd-cdg-variable" size="default" v-model="item.field" clearable
                                      @change="changeField(item)" key="variable">
                                <template #suffix>
                                    <VariableConfig popover
                                                    @confirm="(val) => selectVar(item, val)"></VariableConfig>
                                </template>
                            </el-input>
                        </template>
                        <template v-else>
                            <RuleSelect class="_fd-cdg-field" size="default" onlyField valueType="field"
                                        v-model="item.field" clearable :multiple="false"
                                        @change="changeField(item)" key="field"></RuleSelect>
                        </template>
                        <el-select class="_fd-cdg-term" size="default" v-if="item.formula" v-model="item.condition"
                                   @change="onInput">
                            <el-option v-for="item in item.formula" :key="item.value" :label="item.label"
                                       :value="item.value"/>
                        </el-select>
                        <div class="_fd-cfg-value"
                             v-if="item.input && ['empty', 'notEmpty'].indexOf(item.condition) === -1">
                            <template v-if="item.var">
                                <RuleSelect class="_fd-cdg-field" size="default" onlyField valueType="field"
                                            v-model="item.compare" clearable :multiple="false"
                                            @change="onInput"></RuleSelect>
                            </template>
                            <template v-else-if="item.type === 'variable'">
                                <ValueInput size="default" v-model="item.value" @change="onInput"></ValueInput>
                            </template>
                            <template v-else-if="item.condition === 'pattern'">
                                <PatternInput size="default" :key="item.field" v-model="item.value"
                                              @change="onInput"></PatternInput>
                            </template>
                            <template v-else>
                                <ConditionInput v-bind="item.input" :key="item.field" v-model="item.value"
                                                @change="onInput"></ConditionInput>
                            </template>
                            <el-checkbox v-model="item.var" size="default" :label="t('props.field')"/>
                        </div>
                        <i class="fc-icon icon-delete"
                           @click="removeItem(idx)"></i>
                    </div>
                </template>
            </div>
        </div>
        <div class="_fd-cdg-btns">
            <el-button link type="primary" @click="addItem">
                <i class="fc-icon icon-add-circle"></i>
                {{ t('computed.addCondition') }}
            </el-button>
            <el-button link type="primary" @click="addItemGroup">
                <i class="fc-icon icon-add-circle"></i>
                {{ t('computed.addGroup') }}
            </el-button>
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

._fd-cdg-input {
    display: flex;
    flex-direction: column;
}

._fd-cdg-btns {
    margin-top: 10px;
    margin-left: 30px;
}

._fd-cdg-btns .el-button {
    color: var(--fc-text-color-2);
}

._fd-cdg-item {
    display: flex;
}

._fd-cdg-item .el-select {
    background-color: var(--fc-bg-color-2);
}

._fd-cdg-and {
    display: flex;
    width: 100px;
    position: relative;
    flex-shrink: 0;
}

._fd-cdg-and > .el-select {
    position: absolute;
    top: 50%;
    left: -5px;
    width: 80px;
    margin-top: -16px;
    z-index: 2;
}

._fd-cdg-and:before {
    content: "";
    position: absolute;
    width: 1px;
    left: 30px;
    background-color: var(--fc-line-color-2);
    top: 1px;
    bottom: 1px;
    margin-top: 14px;
    margin-bottom: 16px;
}

._fd-cdg-options {
    display: flex;
    flex-direction: column;
}

._fd-cdg-option {
    position: relative;
    display: flex;
    align-items: center;
}

._fd-cdg-field {
    width: 208px;
}

._fd-cdg-variable {
    width: 208px;
    height: 32px;
}

._fd-cdg-term {
    width: 104px
}

._fd-cdg-option > ._fd-cfg-value {
    width: 208px;
    display: flex;
    align-items: center;
}

._fd-cdg-option > .fc-icon {
    margin-left: 10px;
    cursor: pointer;
    color: var(--fc-text-color-2);
}

._fd-cdg-option > .fc-icon.disabled {
    cursor: not-allowed;
}

._fd-cdg-option > ._fd-cfg-value > div {
    width: 100%;
}

._fd-cdg-option > .el-select + .el-select, ._fd-cdg-option > .el-input + .el-select, ._fd-cdg-option > .el-select + .el-input {
    margin-left: 10px
}

._fd-cfg-value {
    margin-left: 10px;
}

._fd-cfg-value .el-checkbox {
    margin-left: 10px;
}

._fd-cdg-option:before {
    content: "";
    position: absolute;
    width: 105px;
    height: 1px;
    background-color: var(--fc-line-color-2);
    left: -70px;
    top: 50%;
    margin-top: -1px;
}

._fd-cdg-option.is-group {
    border: 1px dashed #ccd3db;
    padding: 14px;
}

._fd-cdg-option.is-group > .fc-icon {
    position: absolute;
    right: -10px;
    top: -10px;
    z-index: 2;
    transform: rotate(45deg);
    font-size: 18px;
}

._fd-cdg-option.is-group:before {
    margin-top: -17px;
}

._fd-cdg-option + ._fd-cdg-option {
    margin-top: 16px;
}

</style>
