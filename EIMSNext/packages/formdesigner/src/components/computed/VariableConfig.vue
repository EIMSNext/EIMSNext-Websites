<template>
    <div class="_fd-variable">
        <template v-if="popover">
            <el-popover ref="pop" placement="bottom" :width="330" :hide-after="0" trigger="click" :persistent="false"
                        popper-class="_fd-variable-pop">
                <template #reference>
                    <i class="fc-icon icon-variable" style="cursor: pointer;"></i>
                </template>
                <el-container style="height: 100%;">
                    <el-header height="55px" class="_fd-variable-pop-header">
                        <el-input v-model="variable">
                            <template #prefix>
                                <span>{&lcub;</span>
                            </template>
                            <template #suffix>
                                }}
                            </template>
                            <template #append>
                                <div @click="confirm">{{ t('props.append') }}</div>
                            </template>
                        </el-input>
                        <i class="fc-icon icon-setting" @click="openVariableConfig"></i>
                    </el-header>
                    <el-main>
                        <el-tree
                            ref="treeRef"
                            :data="treeInfo"
                            :default-expanded-keys="expandedKeys"
                            :expand-on-click-node="false"
                            :indent="10"
                            node-key="id"
                            @nodeClick="nodeClick"
                        >
                            <template #default="{ node, data }">
                                <div class="_fd-variable-pop-node"
                                     :class="{disabled: data.disabled}">
                                    <div>
                                        <span>{{
                                                (data.label || '').trim() || (data.rule ? getTitle(data.rule) : data.id)
                                            }}</span>
                                    </div>
                                    <span>
                                            {{ data.id }}
                                        </span>
                                </div>
                            </template>
                        </el-tree>
                    </el-main>
                </el-container>
            </el-popover>
        </template>
        <template v-else>
            <el-badge :value="eventNum" type="warning" :hidden="eventNum < 1">
                <div class="_fd-variable-btn" @click="open">
                    <i class="fc-icon icon-variable"></i>{{ t('computed.variable.bind') }}
                </div>
            </el-badge>
            <el-dialog class="_fd-variable-dialog _fd-config-dialog"
                       v-model="visible"
                       destroy-on-close
                       :close-on-click-modal="false"
                       append-to-body
                       width="980px">
                <template #header>
                    {{ t('computed.variable.bind') }}
                    <Warning :tooltip="t('warning.variable')"></Warning>
                </template>
                <el-container class="_fd-variable-con" style="height: 600px">
                    <el-main>
                        <el-container class="_fd-variable-l">
                            <el-header>
                                <div style="width: 230px">{{ t('computed.variable.attr') }}</div>
                                <div>{{ t('computed.variable.bind') }}</div>
                            </el-header>
                            <el-main>
                                <template v-for="(item, idx) in fields" :key="item.label">
                                    <div class="_fd-variable-item"
                                         :class="{active: idx === activeIdx, '_fd-variable-top': item.attach === true}">
                                        <div class="_fd-variable-item-label">{{ item.label }}</div>
                                        <div>=</div>
                                        <el-input v-model="item.value" placeholder="_" @focus="activeIdx = idx"
                                                  clearable>
                                            <template #prefix>
                                                <span>{&lcub;</span>
                                            </template>
                                            <template #suffix>
                                                }}
                                            </template>
                                        </el-input>
                                    </div>
                                </template>
                            </el-main>
                        </el-container>
                    </el-main>
                    <el-aside style="width:328px;">
                        <el-container class="_fd-variable-r">
                            <el-header>
                                {{ t('computed.variable.list') }}
                                <i class="fc-icon icon-setting" @click="openVariableConfig"></i>
                            </el-header>
                            <el-main>
                                <div class="_fd-variable-info">
                                    {{t('warning.variableInfo')}}
                                </div>
                                <el-tree
                                    ref="treeRef"
                                    :data="treeInfo"
                                    :default-expanded-keys="expandedKeys"
                                    :expand-on-click-node="false"
                                    node-key="id"
                                    :indent="10"
                                    @nodeClick="nodeClick"
                                >
                                    <template #default="{ node, data }">
                                        <div class="_fd-variable-node"
                                             :class="{disabled: data.disabled}">
                                            <div>
                                        <span>{{
                                                (data.label || '').trim() || (data.rule ? getTitle(data.rule) : data.id)
                                            }}</span>
                                            </div>
                                            <span>
                                            {{ data.id }}
                                        </span>
                                        </div>
                                    </template>
                                </el-tree>
                            </el-main>
                        </el-container>
                    </el-aside>
                </el-container>
                <template #footer>
                    <div>
                        <el-button size="default" @click="visible=false">{{ t('props.cancel') }}</el-button>
                        <el-button type="primary" size="default" @click="submit">{{
                                t('props.ok')
                            }}
                        </el-button>
                    </div>
                </template>
            </el-dialog>
        </template>
    </div>
</template>

<script>
import {defineComponent} from 'vue';
import {lower} from '@eimsnext/form-render-core';
import Warning from '../Warning.vue';

export default defineComponent({
    name: 'VariableConfig',
    components: {Warning},
    emits: ['submit', 'confirm'],
    props: {
        popover: Boolean,
    },
    inject: ['designer'],
    data() {
        return {
            visible: false,
            activeIdx: 0,
            variable: '',
            value: {},
            fields: [],
            expandedKeys: [
                '$topForm', '$cookie', '$localStorage', '$sessionStorage', '$globalData', '$var'
            ],
        };
    },
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        activeRule() {
            return this.designer.setupState.activeRule;
        },
        eventNum() {
            return ((this.activeRule || {})._loadData || []).length;
        },
        treeInfo() {
            const varObj = this.toObject(this.designer.setupState.varList || []);
            const tree = [
                {
                    id: '$topForm',
                    label: this.t('computed.form'),
                    driver: true,
                    children: this.getFormTree(this.designer.setupState.treeInfo)
                },
                {
                    id: '$cookie',
                    label: 'cookie',
                },
                {
                    id: '$localStorage',
                    label: 'localStorage',
                },
                {
                    id: '$sessionStorage',
                    label: 'sessionStorage',
                },
                {
                    id: '$globalData',
                    label: this.t('props.globalData'),
                    driver: true,
                    children: Object.keys((this.designer.setupState.formOptions.globalData || {})).map(k => {
                        return {
                            label: this.designer.setupState.formOptions.globalData[k].label,
                            id: k,
                        }
                    })
                },
                {
                    id: '$var',
                    label: this.t('computed.variable.title'),
                    driver: true,
                    children: Object.keys((this.designer.setupState.formOptions.globalVariable || {})).map(k => {
                        return {
                            label: this.designer.setupState.formOptions.globalVariable[k].label,
                            id: k,
                        }
                    })
                },
            ];
            const activePage = this.designer.setupState.activePage;
            if (!activePage.default && activePage.main.field && activePage.main !== this.activeRule) {
                tree[0].id = '$scopeForm';
                if (tree[0].children.length) {
                    tree[0].children = tree[0].children[0].children;
                }
            }
            if (this.designer.setupState.getConfig('showLanguage') !== false) {
                let lang = this.designer.setupState.formOptions?.language || {};
                let language = lang[this.designer.props?.locale?.name || 'zh-cn'] || lang[Object.keys(lang)[0]] || {};
                tree.push({
                    id: '$t',
                    label: this.t('language.name'),
                    driver: true,
                    children: Object.keys(language).map(k => {
                        return {
                            label: language[k],
                            id: k,
                        }
                    })
                });
            }
            if (varObj['$cookie']) {
                tree[1] = {...tree[1], ...varObj['$cookie']};
            }
            if (varObj['$localStorage']) {
                tree[2] = {...tree[2], ...varObj['$localStorage']};
            }
            if (varObj['$sessionStorage']) {
                tree[3] = {...tree[3], ...varObj['$sessionStorage']};
            }
            if (varObj['$globalData'] && varObj['$globalData'].children) {
                tree[4].children = Object.values({...this.toObject(tree[4].children), ...this.toObject(varObj['$globalData'].children || [])});
            }
            if (varObj['$var'] && varObj['$var'].children) {
                tree[5].children = Object.values({...this.toObject(tree[5].children), ...this.toObject(varObj['$var'].children || [])});
            }

            delete varObj['$cookie'];
            delete varObj['$localStorage'];
            delete varObj['$sessionStorage'];
            delete varObj['$globalData'];
            delete varObj['$var'];
            tree.push(...Object.values(varObj));
            return tree;
        }
    },
    watch: {
        visible(v) {
            if (v) {
                this.updateFields();
                this.activeIdx = 0;
            }
        },
    },
    methods: {
        openVariableConfig() {
            this.designer.setupState.openGlobalVariableDialog();
        },
        toObject(list) {
            const data = {};
            list && list.forEach(item => {
                data[item.id] = item;
            })

            return data;
        },
        nodeClick(data, node) {
            if ((this.popover || this.fields[this.activeIdx]) && !data.driver) {
                let val = data.id;
                node = node.parent;
                while (node.level >= 1) {
                    val = (node.data.id) + '.' + val;
                    node = node.parent;
                }
                if (this.popover) {
                    this.variable = val;
                } else {
                    this.fields[this.activeIdx].value = val;
                }
            }
        },
        getTitle(rule) {
            return (rule?.__fc__?.refRule?.__$title?.value || rule.title || '').trim() || (rule._menu && rule._menu.label) || rule.field || rule._fc_id;
        },
        getFormTree(children) {
            const fields = [];
            children.forEach(({rule, children}) => {
                const childrenFields = (rule.field && (!rule._menu || rule._menu.subForm !== 'object')) ? [] : this.getFormTree(children || []);
                if (rule.field) {
                    const item = {
                        id: rule.field,
                        label: rule?.__fc__?.refRule?.__$title?.value || rule.title,
                        rule,
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
        tranField(str) {
            if (str.indexOf('formCreate') === 0) {
                str = lower(str.replace('formCreate', ''));
            } else {
                str = 'props.' + str;
            }
            return str.replaceAll('>', '.');
        },
        updateFields() {
            const vm = this.designer.setupState;
            const fields = [];
            const loadData = {};
            (vm.activeRule._loadData || []).forEach(item => {
                loadData[item.to] = item.attr;
            });
            const important = [];
            if (vm.activeRule.field) {
                important.push({
                    label: this.t('computed.value.name'),
                    attach: true,
                    modify: true,
                    field: 'value'
                });
            }
            const rules = vm.propsForm.api.model();
            Object.keys(rules).forEach(k => {
                if (k && (k[0] !== '_' || rules[k]._fc_important_prop) && rules[k].title && rules[k]._fc_important_prop !== false && !rules[k].hidden && false !== rules[k].display) {
                    const prop = typeof rules[k]._fc_important_prop === 'string' ? rules[k]._fc_important_prop : k;
                    (rules[k]._fc_important_prop === true ? important : fields).push({
                        label: rules[k].title,
                        modify: prop === 'formCreateChild',
                        field: this.tranField(prop)
                    })
                }
            });
            fields.unshift(...important);
            fields.forEach(item => {
                item.value = loadData[item.field] || '';
            });

            this.fields = fields;
        },
        open() {
            this.visible = true;
        },
        active(idx) {
            if (this.activeIdx !== idx) {
                this.activeIdx = idx;
            }
        },
        submit() {
            const loadData = [];
            this.fields.forEach(item => {
                let val = (item.value || '').trim();
                if (val) {
                    const data = {
                        attr: val,
                        to: item.field
                    };
                    if (item.modify) {
                        data.modify = true;
                    }
                    loadData.push(data);
                }
            });
            this.designer.setupState.activeRule._loadData = loadData;
            this.visible = false;
        },
        confirm() {
            const val = (this.variable || '').trim();
            if (val) {
                this.$emit('confirm', `{{${val}}}`);
                this.$refs.pop.hide();
                this.variable = '';
            }
        },
    },
});
</script>

<style>
._fd-variable-btn {
    margin-left: 6px;
    background: var(--fc-style-bg-color-1);
    border-radius: 5px;
    color: var(--fc-style-color-1);
    display: flex;
    align-items: center;
    font-size: 12px;
    padding: 2px 6px;
    cursor: pointer;
}

._fd-variable-con .el-main {
    padding: 0;
}

._fd-variable-l, ._fd-variable-r {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    border: 1px solid var(--fc-line-color-3);
}

._fd-variable-r {
    margin-left: 10px;
}

._fd-variable-l .el-header, ._fd-variable-r .el-header {
    display: flex;
    align-items: center;
    height: 40px;
    background: var(--fc-bg-color-3);
    color: var(--fc-text-color-1);
    font-size: 13px;
}

._fd-variable-r .el-header .fc-icon {
    font-size: 13px;
    margin-left: 2px;
    color: var(--fc-style-color-1);
    cursor: pointer;
}

._fd-variable-r .el-main {
    padding: 10px;
}

._fd-variable-info {
    display: flex;
    font-size: 12px;
    position: relative;
    margin-bottom: 6px;
    padding: 8px 13px;
    line-height: 18px;
    background: rgba(170, 170, 170, 0.1);
    border-radius: 6px;
    color: var(--fc-text-color-2);
}

._fd-variable-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 26px;
    line-height: 26px;
    padding-right: 5px;
    font-size: 13px;
    color: var(--fc-text-color-1);
}

._fd-variable-node > span {
    color: var(--fc-text-color-3);
    font-size: 12px;
}

._fd-variable-item {
    display: flex;
    align-items: center;
    min-height: 40px;
    padding: 0 20px;
    border-bottom: 1px solid var(--fc-line-color-3);;
}

._fd-variable-top ._fd-variable-item-label {
    color: #fca130;
}

._fd-variable-item-label {
    width: 198px;
    margin-right: 18px;
    font-size: 13px;
}

._fd-variable-item .el-input {
    display: flex;
    flex: 1;
    margin-top: 4px;
    font-size: 13px;
}

._fd-variable-item.active, ._fd-variable-item.active ._fd-variable-item-label, ._fd-variable-item.active input {
    color: var(--fc-style-color-1);
}

._fd-variable-item.active .el-input {
    --el-input-icon-color: var(--fc-style-color-1);
}

._fd-variable-item input {
    text-align: center;
}

._fd-variable-item .el-input .el-input__wrapper {
    box-shadow: none;
}

._fd-variable-pop.el-popover.el-popper {
    height: 400px;
    padding: 0;
}

._fd-variable-pop-header .fc-icon {
    color: var(--fc-style-color-1);
    margin-left: 4px;
    cursor: pointer;
}

._fd-variable-pop .el-header {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--fc-line-color-3);
    padding: 0 10px;
    background-color: var(--fc-bg-color-2)
}

._fd-variable-pop .el-main {
    padding: 10px;
}

._fd-variable-pop .el-tree-node__content > .el-tree-node__expand-icon {
    padding: 3px;
}

._fd-variable-pop .el-input-group__append {
    background: var(--fc-style-color-1);
    color: #FFFFFF;
    cursor: pointer;
    width: 60px;
    padding: 0;
}

._fd-variable-pop .el-input-group__append div {
    width: 100%;
    text-align: center;
}

._fd-variable-pop-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 26px;
    line-height: 26px;
    padding-right: 5px;
    font-size: 13px;
}

._fd-variable-pop-node > span {
    color: var(--fc-text-color-3);
    font-size: 12px;
}

</style>
