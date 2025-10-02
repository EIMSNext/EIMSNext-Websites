<template>
    <el-tree-select class="_fd-rule-select" :modelValue="modelValue" @update:modelValue="input" :size="size"
                    :multiple="multiple" checkStrictly
                    :showCheckbox="multiple" :data="tree">
        <template #default="{ data }">
            <template v-if="data.value === '___subform'">
                <div class="_fd-rule-select-node">
                    <div>{{ data.label }}</div>
                    <span>{{ t('props.subform') }}</span>
                </div>
            </template>
            <template v-else>
                {{ data.label }}
            </template>
        </template>
    </el-tree-select>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'RuleSelect',
    inject: ['designer'],
    emits: ['update:modelValue', 'change'],
    props: {
        modelValue: [String, Number, Array],
        onlyField: Boolean,
        valueType: String,
        size: String,
        multiple: Boolean,
    },
    computed: {
        activeRule() {
            return this.designer.setupState.activeRule;
        },
        t() {
            return this.designer.setupState.t;
        },
        tree() {
            const activePage = this.designer.setupState.activePage;
            let tree = [];
            if (activePage.default) {
                tree = this.getFields(this.designer.setupState.treeInfo);
            } else {
                tree = this.getFields(activePage.main.field && activePage.main === this.activeRule ? this.designer.setupState.treeInfo : this.designer.setupState.treeInfo[0].children);
            }
            let ctx = this.activeRule.__fc__.parent;
            while (ctx) {
                if (ctx.rule === activePage.main) {
                    ctx = undefined;
                } else if (ctx.rule._menu && ['array', 'object'].indexOf(ctx.rule._menu.subForm) > -1) {
                    const subTree = this.getFields(this.designer.setupState.findTree(ctx.rule.field))
                    if (subTree.length) {
                        tree.unshift({
                            value: '___subform',
                            disabled: true,
                            label: ctx.refRule?.__$title?.value || ctx.rule.title || ctx.rule._menu.label,
                            children: subTree
                        })
                    }
                    ctx = undefined;
                } else {
                    ctx = ctx.parent;
                }
            }
            return tree;
        }
    },
    methods: {
        getFields(children, parent = []) {
            const fields = [];
            children.forEach(({rule, children}) => {
                const temp = [...parent];
                if (rule.field) {
                    temp.push(rule);
                }
                const childrenFields = rule._menu.subForm === 'array' ? [] : this.getFields(children || [], temp);
                if (!this.onlyField || this.onlyField && rule.field) {
                    const item = {
                        value: parent.length ? (parent.map(item => item[this.valueType || '_fc_id']).join('.') + '.' + rule[this.valueType || '_fc_id']) : rule[this.valueType || '_fc_id'],
                        label: (rule?.__fc__?.refRule?.__$title?.value || rule.title || '').trim() || (rule.props && rule.props.label) || this.t('com.' + (rule._menu && rule._menu.name) + '.name') || (rule._menu && rule._menu.label) || rule.type,
                        rule,
                        parent,
                    };
                    if (childrenFields.length) {
                        item.children = childrenFields;
                    }
                    fields.push(item);
                } else {
                    fields.push(...childrenFields)
                }
            });
            return fields;
        },
        input(value) {
            this.$emit('update:modelValue', value);
            this.$emit('change', value);
        },
    }
});
</script>

<style>
.el-tree._fd-rule-select {
    min-width: 200px;
}

._fd-rule-select .el-tree-node:has(._fd-rule-select-node) {
    border-bottom: 1px solid var(--fc-line-color-3);
    border-bottom-style: dashed;
    padding-bottom: 5px;
}

._fd-rule-select .el-tree-node:has(._fd-rule-select-node) > .el-tree-node__content > .el-checkbox {
    display: none;
}

._fd-rule-select .el-tree-node:has(._fd-rule-select-node) > .el-tree-node__content > .el-select-dropdown__item {
    padding-right: 20px;
}

._fd-rule-select-node {
    display: flex;
    justify-content: space-between;
}

._fd-rule-select-node > div {
    color: #61affe;
}

._fd-rule-select-node > span {
    font-size: 12px;
}
</style>
