<template>
    <div class="_fd-event">
        <el-badge :value="eventNum" type="warning" :hidden="eventNum < 1">
            <el-button class="_fd-plain-button" plain size="small" @click="visible=true">{{
                    t('event.title')
                }}
            </el-button>
        </el-badge>
        <el-dialog class="_fd-event-dialog _fd-config-dialog" :title="t('event.title')" v-model="visible"
                   destroy-on-close
                   :close-on-click-modal="false"
                   append-to-body
                   width="1080px">
            <el-container class="_fd-event-con" style="height: 600px">
                <el-aside style="width:300px;">
                    <el-container class="_fd-event-l">
                        <el-header class="_fd-event-head" height="40px">
                            <el-dropdown popper-class="_fd-event-dropdown" trigger="click" size="default"
                                         :placement="'bottom-start'">
                                <el-button link type="primary" size="default">
                                    {{ t('event.create') }}<i class="fc-icon icon-down" style="font-size: 14px;"></i>
                                </el-button>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item v-for="name in eventName" :key="name" @click="add(name)"
                                                          :disabled="useEventKeys.indexOf(name) > -1">
                                            <div class="_fd-event-item">
                                                <span>{{ name }}</span>
                                                <span class="_fd-label" v-if="eventInfo[name]">
                                                    {{ eventInfo[name] }}
                                                </span>
                                            </div>
                                        </el-dropdown-item>
                                        <template v-for="(hook, idx) in hookList">
                                            <el-dropdown-item :divided="eventName.length > 0 && !idx"
                                                              @click="add(hook)"
                                                              :disabled="useEventKeys.indexOf(hook) > -1">
                                                <div class="_fd-event-item">
                                                    <div> {{ hook }}</div>
                                                    <span class="_fd-label">
                                                    {{ eventInfo[hook] }}
                                                </span>
                                                </div>
                                            </el-dropdown-item>
                                        </template>
                                        <el-dropdown-item :divided="eventName.length > 0 || hook" @click="cusEvent">
                                            <div>{{ t('props.custom') }}</div>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </el-header>
                        <el-main>
                            <div class="_fd-menu">
                                <template v-for="(item, idx) in event" :key="item.id">
                                    <div class="_fd-menu-item" :class="{'is-active': item.id === defActive }">
                                        <div class="_fd-event-title"
                                             @click.stop="edit(idx)">
                                            <div class="_fd-event-method">
                                                        <span>function<span>{{
                                                                item.name
                                                            }}</span></span>
                                                <span class="_fd-label"
                                                      v-if="eventInfo[item.name]">{{ eventInfo[item.name] }}</span>
                                            </div>
                                            <el-tooltip
                                                effect="dark"
                                                :content="t('behavior.add')"
                                                placement="top"
                                                :hide-after="0"
                                                v-if="item.name !== 'hook_load'"
                                            >
                                                <i class="fc-icon icon-task-add"
                                                   @click.stop="addBehavior(idx)"></i>
                                            </el-tooltip>
                                            <i class="fc-icon icon-delete-circle"
                                               @click.stop="rm(idx)"></i>
                                        </div>
                                        <div class="_fd-event-behaviors">
                                            <fcDraggable :group="{name:'behavior', put:false}" :sort="true"
                                                         handle=".icon-drag" direction="vertical" :animation="0"
                                                         itemKey="_fc_id"
                                                         :list="item.behaviors">
                                                <template #item="{element,index}">
                                                    <div class="_fd-event-behavior"
                                                         :class="{'is-active': element.id === defActive }"
                                                         @click.stop="editBehavior(idx,index)">
                                                        <div class="_fd-event-behavior-label">
                                                            <div>
                                                                <i class="fc-icon icon-drag"></i>
                                                                <span>{{
                                                                        t('behavior.' + element.method + '.name')
                                                                    }}</span>
                                                            </div>
                                                            <i class="fc-icon icon-delete-circle"
                                                               @click.stop="rmBehavior(idx, index)"></i>
                                                        </div>
                                                        <div class="_fd-event-behavior-info">
                                                            {{
                                                                t('behavior.' + element.method + '.info') || t('behavior.' + element.method + '.name')
                                                            }}
                                                        </div>
                                                    </div>
                                                </template>
                                            </fcDraggable>
                                        </div>
                                    </div>
                                </template>
                                <div class="_fd-menu-item" v-if="cus" style="padding-left: 10px;">
                                    <div class="_fd-event-title">
                                        <el-input type="text" v-model="cusValue" size="default"
                                                  @keydown.enter="addCus"
                                                  :placeholder="t('event.placeholder')">
                                        </el-input>
                                        <div>
                                            <i class="fc-icon icon-add" @click.stop="addCus"></i>
                                            <i class="fc-icon icon-delete" @click.stop="closeCus"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </el-main>
                    </el-container>
                </el-aside>
                <el-main>
                    <el-container class="_fd-event-r">
                        <el-header class="_fd-event-head" height="40px" v-if="activeData || activeBehavior">
                            <el-button size="small" @click="close">{{ t('props.cancel') }}</el-button>
                            <el-button size="small" type="primary" @click="save">{{
                                    t('props.save')
                                }}
                            </el-button>
                        </el-header>
                        <el-main v-if="activeData">
                            <el-tabs v-model="eventType" class="_fc-tabs" :key="activeData.key">
                                <el-tab-pane :label="t('props.custom')" name="fn" lazy>
                                    <FnEditor ref="fn" v-model="eventStr" body :name="activeData.name"
                                              :args="fnArgs"
                                              style="height: 519px;"/>
                                </el-tab-pane>
                                <el-tab-pane :label="t('form.globalEvent')" name="event">
                                    <div class="_fd-event-select">
                                        <el-select v-model="eventKey" clearable filterable
                                                   style="width: 240px;margin-left: 15px;">
                                            <el-option
                                                v-for="item in options"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                            />
                                        </el-select>
                                        <span class="_fc-manage-text" @click="openConfig"><i
                                            class="fc-icon icon-setting"/></span>
                                    </div>
                                </el-tab-pane>
                            </el-tabs>
                        </el-main>
                        <el-main v-if="activeBehavior" class="is-behavior">
                            <el-aside width="220px" class="_fd-event-behavior-list">
                                <div class="_fd-event-behavior-title">
                                    {{ t('behavior.props.execute') }}
                                </div>
                                <el-menu :defaultActive="activeBehavior.method" @select="handleSelect">
                                    <template v-for="item in behaviorMenu">
                                        <el-sub-menu :index="item.label">
                                            <template #title>
                                                <span>{{ t('props.' + item.label) }}</span>
                                            </template>
                                            <template v-for="data in item.children" :key="data.value">
                                                <el-menu-item :index="data.value">{{
                                                        t('behavior.' + data.label + '.name')
                                                    }}
                                                </el-menu-item>
                                            </template>
                                        </el-sub-menu>
                                    </template>
                                </el-menu>
                            </el-aside>
                            <el-main class="_fd-event-behavior-con">
                                <div class="_fd-event-behavior-title">
                                    {{ t('behavior.props.info') }}
                                    <div>{{
                                            t('behavior.' + activeBehavior.method + '.info') || t('behavior.' + activeBehavior.method + '.name')
                                        }}
                                    </div>
                                </div>
                                <div class="_fd-event-behavior-title" v-if="form.rule && form.rule.length">
                                    {{ t('designer.rule') }}
                                </div>
                                <DragForm v-if="form.rule && form.rule.length"
                                          :rule="form.rule" :option="form.options"
                                          v-model="form.formData" v-model:api="form.api">
                                    <template #title="scope">
                                        <template v-if="scope.rule.warning">
                                            <Warning :tooltip="scope.rule.warning">
                                                {{ scope.rule.title }}
                                            </Warning>
                                        </template>
                                        <template v-else>
                                            {{ scope.rule.title }}
                                        </template>
                                    </template>
                                </DragForm>
                                <div class="_fd-event-behavior-title">
                                    {{ t('designer.advanced') }}
                                </div>
                                <el-form size="small" labelWidth="auto">
                                    <el-form-item :label="t('behavior.props.ignoreError')">
                                        <el-radio-group v-model="activeBehavior.ignoreError">
                                            <el-radio-button :value="true">{{
                                                    t('behavior.props.continue')
                                                }}
                                            </el-radio-button>
                                            <el-radio-button :value="false">{{
                                                    t('behavior.props.stop')
                                                }}
                                            </el-radio-button>
                                        </el-radio-group>
                                        <div class="_fd-form-item-warning">{{ t('warning.behaviorIgnoreError') }}</div>
                                    </el-form-item>
                                    <el-form-item :label="t('behavior.props.expression')">
                                        <ComputedConfig v-model="activeBehavior.expression"
                                                        :title="t('behavior.props.setFormula')"
                                                        :invertLabel="t('behavior.props.break')"
                                                        :validLabel="t('behavior.props.continue')"></ComputedConfig>
                                        <div class="_fd-form-item-warning">{{ t('warning.behaviorExpression') }}</div>
                                    </el-form-item>
                                    <el-form-item :label="t('behavior.props.stopPropagation')">
                                        <ComputedConfig v-model="activeBehavior.stopPropagation"
                                                        :title="t('behavior.props.setFormula')"
                                                        :invertLabel="t('behavior.props.continue')"
                                                        :validLabel="t('behavior.props.stop')"></ComputedConfig>
                                        <div class="_fd-form-item-warning">{{ t('warning.behaviorStopPropagation') }}</div>
                                    </el-form-item>
                                </el-form>
                            </el-main>
                        </el-main>
                    </el-container>
                </el-main>
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
    </div>
</template>

<script>
import { uniqueId, deepExtend, is } from '@eimsnext/form-render-core';
import {defineComponent} from 'vue';
import FnEditor from './FnEditor.vue';
import {getInjectArg} from '../utils';
import {behaviorRules, behaviorTree} from '../utils/behavior';
import ComputedConfig from './computed/ComputedConfig.vue';
import {designerForm} from '../utils/form';
import fcDraggable from 'vuedraggable/src/vuedraggable';
import Warning from './Warning.vue';

const $T = '$FNX:';

const isFNX = v => {
    return is.String(v) && v.indexOf($T) === 0;
};

export default defineComponent({
    name: 'EventConfig',
    emits: ['update:modelValue'],
    props: {
        modelValue: [Object, undefined, null],
        componentName: '',
        hook: {
            type: Boolean,
            default: true,
        },
        eventName: {
            type: Array,
            default: () => []
        }
    },
    inject: ['designer'],
    components: {
        Warning,
        ComputedConfig,
        FnEditor,
        fcDraggable,
        DragForm: designerForm.$form(),
    },
    data() {
        return {
            visible: false,
            activeData: null,
            activeBehavior: null,
            val: null,
            defActive: 'no',
            hookList: ['hook_load', 'hook_mounted', 'hook_deleted', 'hook_watch', 'hook_value', 'hook_hidden'],
            event: [],
            cus: false,
            cusValue: '',
            eventType: 'fn',
            eventKey: '',
            eventStr: '',
            eventNum: 0,
            id: 0,
            form: {
                rule: [],
                options: {
                    form: {
                        labelPosition: 'right',
                        size: 'small',
                        labelWidth: 'auto',
                    },
                    appendValue: false,
                    submitBtn: false,
                },
                api: {},
                formData: {}
            }
        };
    },
    computed: {
        useEventKeys() {
            const events = {};
            this.event.forEach(item => {
                events[item.name] = true;
            });
            return Object.keys(events);
        },
        behaviorMenu() {
            const tree = [];
            behaviorTree.forEach(item => {
                tree.push({
                    label: item.key,
                    children: item.children.map(k => {
                        return {
                            label: k,
                            value: k
                        }
                    })
                })
            });
            return tree;
        },
        t() {
            return this.designer.setupState.t;
        },
        activeRule() {
            return this.designer.setupState.activeRule;
        },
        eventInfo() {
            const info = {};
            this.eventName.forEach(v => {
                info[v] = this.t('com.' + this.componentName + '.event.' + v) || this.t('eventInfo.' + v) || '';
            })
            this.hookList.forEach(v => {
                info[v] = this.t('eventInfo.' + v) || '';
            })
            return info;
        },
        globalEvent() {
            return this.designer.setupState.formOptions.globalEvent || {};
        },
        options() {
            return Object.keys(this.globalEvent).map(k => {
                return {
                    label: this.globalEvent[k].label,
                    value: '$GLOBAL:' + k
                }
            })
        },
        fnArgs() {
            return [getInjectArg(this.t)];
        }
    },
    watch: {
        visible(v) {
            if (!v) {
                this.destroy();
                this.closeCus();
            } else {
                this.init();
            }
        },
    },
    methods: {
        openConfig() {
            this.designer.setupState.openGlobalEventDialog();
        },
        addCus() {
            const val = this.cusValue && this.cusValue.trim();
            if (val) {
                this.closeCus();
                this.add(val);
            }
        },
        closeCus() {
            this.cus = false;
            this.cusValue = '';
        },
        cusEvent() {
            this.cus = true;
        },
        loadFnStr(v) {
            if (isFNX(v)) {
                return v.replace($T, '');
            } else if (is.Function(v)) {
                const json = v.__json || '';
                if (!json) {
                    return '' + v;
                } else if (isFNX(json)) {
                    return json.replace($T, '');
                } else {
                    return json;
                }
            } else if (v && v.indexOf('$GLOBAL:') === 0) {
                return v;
            }
        },
        parseBehavior(behavior) {
            behavior.id = this.id++;
            if (behavior.method === 'callback') {
                const fn = this.loadFnStr(behavior.callback);
                if (fn) {
                    behavior.callback = fn;
                }
            }
            return behavior;
        },
        init() {
            const behaviors = this.activeRule ? deepCopy(this.activeRule.$behavior || {}) : {};
            const hooks = this.activeRule ? {...this.activeRule.hook || {}} : {};
            const ons = {...deepCopy(this.modelValue || {})};
            Object.keys(hooks).forEach(k => {
                ons['hook_' + k] = hooks[k];
            })
            const event = [];
            Object.keys(ons).forEach(k => {
                const val = Array.isArray(ons[k]) ? ons[k] : [ons[k]];
                val.forEach(v => {
                    const item = {
                        name: k,
                        id: this.id++,
                    };
                    const fn = this.loadFnStr(v);
                    if (fn) {
                        item.handle = fn;
                    }
                    item.behaviors = (behaviors[k] || []).map(this.parseBehavior);
                    delete behaviors[k];
                    event.push(item);
                });
            });
            Object.keys(behaviors).forEach(k => {
                event.push({
                    name: k,
                    id: this.id++,
                    handle: '',
                    behaviors: (behaviors[k] || []).map(this.parseBehavior)
                });
            });
            this.event = event;
            this.eventNum = event.length;
        },
        getValue() {
            const on = {};
            const behaviors = {};
            const hooks = {};
            let num = 0;

            this.event.forEach(item => {
                let flag = false;
                if (item.handle) {
                    flag = true;
                    let list = on;
                    const handle = item.handle.indexOf('$GLOBAL:') !== 0 ? ($T + item.handle) : item.handle;
                    if (item.name.indexOf('hook_') > -1) {
                        hooks[item.name.replace('hook_', '')] = handle;
                    } else {
                        if (!list[item.name]) {
                            list[item.name] = [];
                        }
                        list[item.name].push(handle);
                    }
                }
                if (item.behaviors && item.behaviors.length) {
                    flag = true;
                    behaviors[item.name] = item.behaviors.map(behavior => {
                        delete behavior.id;
                        return behavior;
                    });
                }
                if (flag) {
                    num++;
                }
            });

            Object.keys(on).forEach(k => {
                on[k] = on[k].length === 1 ? on[k][0] : on[k];
            });

            return {on, behaviors, hooks, num};
        },
        add(name) {
            this.event.push({
                name,
                id: this.id++,
                behaviors: [],
            })
            if (!this.activeData) {
                this.edit(this.event.length - 1);
            }
        },
        edit(idx) {
            if (this.defActive === this.event[idx].id) {
                return;
            }
            this.destroy();
            this.activeData = this.event[idx];
            this.val = this.activeData.handle || '';
            this.eventType = this.val.indexOf('$GLOBAL:') === 0 ? 'event' : 'fn';
            if (this.eventType === 'event') {
                this.eventKey = this.val;
                this.eventStr = '';
            } else {
                this.eventStr = this.val;
                this.eventKey = '';
            }
            this.defActive = this.activeData.id;
        },
        rm(idx) {
            this.event.splice(idx, 1);
            if ((this.activeData && this.defActive === this.activeData.id) || (this.activeBehavior && idx === this.activeBehavior.pid)) {
                this.destroy();
            }
        },
        save() {
            return new Promise((resolve) => {
                if (this.activeData) {
                    let str = this.eventKey;
                    if (this.eventType !== 'event') {
                        if (!this.$refs.fn.save()) {
                            return false;
                        }
                        str = this.eventStr;
                    }
                    this.activeData.handle = str;
                    this.destroy();
                    resolve();
                } else if (this.activeBehavior) {
                    const update = (config) => {
                        this.activeBehavior.config = {...config || {}};
                        const behavior = {...this.activeBehavior};
                        const pid = behavior.pid;
                        if (!Object.keys(behavior.config).length) {
                            delete behavior.config;
                        }
                        delete behavior.pid;
                        this.event[pid].behaviors.forEach((item, idx) => {
                            if (item.id === behavior.id) {
                                this.event[pid].behaviors[idx] = behavior;
                            }
                        });
                    };
                    if (this.form.rule && this.form.rule.length) {
                        this.form.api.validate().then(() => {
                            update(this.form.formData);
                            this.destroy();
                            resolve();
                        }).catch(() => {
                        });
                    } else {
                        update();
                        this.destroy();
                        resolve();
                    }
                } else {
                    resolve();
                }
            });
        },
        addBehavior(idx) {
            this.event[idx].behaviors.push({
                method: 'openModel',
                id: this.id++,
                ignoreError: false,
                stopPropagation: '',
                expression: '',
            })
            if (!this.activeData && !this.activeBehavior) {
                this.editBehavior(idx, this.event[idx].behaviors.length - 1);
            }
        },
        editBehavior(pid, idx) {
            this.destroy();
            this.activeBehavior = deepCopy(this.event[pid].behaviors[idx]);
            this.activeBehavior.pid = pid;
            this.defActive = this.activeBehavior.id;
            this.updateBehaviorForm();
        },
        updateBehaviorForm() {
            let rule = behaviorRules[this.activeBehavior.method];
            if (is.Function(rule)) {
                rule = rule(this.designer.setupState);
            }
            const loadT = (item) => {
                if (item.field && !item.title) {
                    item.title = this.t('behavior.' + this.activeBehavior.method + '.props.' + item.field) || this.t('behavior.props.' + item.field) || this.t('props.' + item.field);
                    item.warning = this.t('behavior.' + this.activeBehavior.method + '.warning.' + item.field);
                }
            }
            if (rule) {
                this.form.rule = rule.map(item => {
                    loadT(item);
                    if (item.control) {
                        item.control.forEach(control => {
                            control.rule && control.rule.forEach(item => {
                                loadT(item);
                            });
                        });
                    }
                    return item;
                });
                this.$nextTick(() => {
                    this.form.formData = this.activeBehavior.config || {};
                });
            } else {
                this.clearBehaviorForm();
            }
        },
        clearBehaviorForm() {
            this.form.rule = [];
            this.form.formData = {};
        },
        rmBehavior(pid, idx) {
            this.event[pid].behaviors.splice(idx, 1);
            if (this.activeBehavior && this.defActive === this.activeBehavior.id) {
                this.destroy();
            }
        },
        handleSelect(behavior) {
            if (this.activeBehavior.method === behavior) {
                return;
            }
            this.activeBehavior.method = behavior;
            this.updateBehaviorForm();
        },
        destroy() {
            this.activeBehavior = null;
            this.activeData = null;
            this.val = null;
            this.defActive = null;
            this.clearBehaviorForm();
        },
        close() {
            this.destroy();
        },
        submit() {
            this.save().then(() => {
                const {on, behaviors, num, hooks} = this.getValue();
                this.$emit('update:modelValue', on);
                this.activeRule.$behavior = behaviors;
                this.activeRule.hook = hooks;
                this.visible = false;
                this.eventNum = num;
            });
        },
    },
    beforeCreate() {
        window.$inject = {
            $f: {},
            rule: [],
            self: {},
            option: {},
            inject: {},
            args: [],
        };
    },
    created() {
        this.init();
    }
});
</script>

<style>

._fd-event .el-button {
    font-weight: 400;
    width: 100%;
}

._fd-event .el-badge {
    width: 100%;
}

._fd-menu {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
}

._fd-menu-item {
    padding: 0 15px;
    border: 1px solid transparent;
    border-bottom: 1px dashed var(--fc-line-color-3);
}

._fd-menu-item.is-active {
    border: 1px solid var(--fc-style-color-1);
}

._fd-menu-item.is-active ._fd-event-title i {
    color: var(--fc-style-color-1);
}

._fd-event-dialog .el-tabs__header {
    margin: 0;
}

._fd-event-select {
    display: flex;
    align-items: center;
    margin-left: 15px;
    margin-top: 15px;
}

._fd-event-select .el-select {
    width: 240px;
}

._fd-event-con .el-main {
    padding: 0;
}

._fd-event-l, ._fd-event-r {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    border: 1px solid var(--fc-line-color-3);
}

._fd-event-dropdown .el-dropdown-menu {
    max-height: 500px;
    overflow: auto;
}

._fd-event-head {
    display: flex;
    padding: 5px 15px;
    border-bottom: 1px solid var(--fc-line-color-3);
    background: var(--fc-bg-color-3);
    align-items: center;
}

._fd-event-head .el-button.is-link {
    color: var(--fc-style-color-1);
}

._fd-event-r {
    border-left: 0 none;
}

._fd-event-r ._fd-event-head {
    justify-content: flex-end;
}

._fd-event-l > .el-main, ._fd-event-r > .el-main {
    display: flex;
    flex-direction: row;
    flex: 1;
    flex-basis: auto;
    box-sizing: border-box;
    min-width: 0;
    width: 100%;
}

._fd-event-r > .el-main {
    flex-direction: column;
}

._fd-event-r > .el-main.is-behavior {
    flex-direction: unset;
}

._fd-event-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 250px;
    font-size: 14px;
    overflow: hidden;
    white-space: pre-wrap;
}

._fd-event-item ._fd-label {
    font-size: 12px;
    color: var(--fc-text-color-3);
}


._fd-event-l .el-menu-item.is-active ._fd-event-title i {
    color: var(--fc-style-color-1);
}

._fd-event-method {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 225px;
    font-size: 14px;
    font-family: monospace;
    color: #9D238C;
    overflow: hidden;
    white-space: pre-wrap;
}

._fd-event-method ._fd-label {
    margin-top: 4px;
    color: var(--fc-text-color-3);
    font-size: 12px;
}

._fd-event-method > span:first-child, ._fd-fn-list-method > span:first-child {
    color: #9D238C;
}

._fd-event-method > span:first-child > span, ._fd-fn-list-method > span:first-child > span {
    color: var(--fc-text-color-1);
    margin-left: 10px;
}

._fd-event-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px 0;
    cursor: pointer;
}

._fd-event-title .fc-icon {
    margin-right: 6px;
    font-size: 18px;
    color: var(--fc-text-color-2);
}

._fd-event-title .el-input {
    width: 200px;
}

._fd-event-title .el-input__wrapper {
    box-shadow: none;
}

._fd-event-con .CodeMirror {
    height: 100%;
    width: 100%;
}

._fd-event-con .CodeMirror-wrap pre.CodeMirror-line {
    padding-left: 20px;
}

._fd-event-behaviors {
    width: 100%;
}

._fd-event-behavior {
    width: 100%;
    background: var(--fc-bg-color-3);
    border-radius: 5px 5px 5px 5px;
    padding: 12px;
    box-sizing: border-box;
    margin-bottom: 12px;
    cursor: pointer;
    font-size: 12px;
}

._fd-event-behavior.is-active {
    background: var(--fc-style-color-1);
}

._fd-event-behavior.is-active ._fd-event-behavior-info, ._fd-event-behavior.is-active ._fd-event-behavior-label {
    color: #FFFFFF;
}

._fd-event-behavior-label {
    display: flex;
    justify-content: space-between;
    color: var(--fc-text-color-2);
}

._fd-event-behavior-label > div {
    display: flex;
}

._fd-event-behavior-info {
    color: var(--fc-text-color-3);
    margin-left: 16px;
}

._fd-event-behavior-list {
    height: 100%;
    padding: 15px;
    border-right: 1px solid var(--fc-line-color-3);
}

._fd-event-behavior-list .el-sub-menu__title, ._fd-event-behavior-list .el-menu-item {
    height: 30px;
}

._fd-event-behavior-list .el-menu {
    border-right: 0 none;
}

._fd-event-behavior-list .el-menu-item.is-active {
    background: var(--fc-style-color-1);
    color: #FFFFFF;
}

._fd-event-behavior-list .el-menu-item, ._fd-event-behavior-list .el-sub-menu__title {
    border-radius: 6px !important;
    margin-bottom: 4px;
}

._fd-event-con ._fd-event-behavior-con {
    padding: 15px;
}

._fd-event-con .form-create .form-create .el-form-item {
    margin-bottom: 18px;
}

._fd-event-con .el-form ._fd-form-item-warning {
    font-weight: 400;
    font-size: 12px;
    color: var(--fc-text-color-3);
    line-height: 17px;
    margin-top: 6px;
}

._fd-event-behavior-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--fc-text-color-1);
    margin-bottom: 12px;
}

._fd-event-behavior-title > div {
    font-size: 12px;
    font-weight: initial;
    color: var(--fc-text-color-3);
}
</style>
