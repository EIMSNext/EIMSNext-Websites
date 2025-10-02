<template>
    <div class="_fc-sublist">
        <p class="_fc-r-title">
            <span>{{ t('designer.sublist') }}</span>
            <i class="fc-icon icon-add-circle"
               @click="toolHandle(activeRule ,'addChild')"></i>
        </p>
        <fcDraggable :group="{name:'sub', pull:'clone', put:false}" :sort="true"
                   handle=".icon-drag" direction="vertical" :animation="0"
                   itemKey="_fc_id"
                   @end="end"
                   :list="activeRuleChildren">
            <template #item="{element,index}">
                <ConfigItem>
                    <template #label>
                        <i class="fc-icon icon-drag"></i>
                        <span>{{
                                (t('com.' + (element._menu.name) + '.name') || activeRule._menu.label) + ' ' + (index + 1)
                            }}</span>
                    </template>
                    <i class="fc-icon icon-copy" @click="toolHandle(element ,'copy')"></i>
                    <i class="fc-icon icon-delete" @click="toolHandle(element ,'delete')"></i>
                    <template #append v-if="activeRule._menu.subRender">
                        <VNode
                            :fn="()=>subRender(activeRule._menu.subRender, activeRule, element)"></VNode>
                    </template>
                </ConfigItem>
            </template>
        </fcDraggable>
    </div>
</template>

<script>
import {defineComponent} from 'vue';
import ConfigItem from './style/ConfigItem.vue';
import VNode from './VNode.vue';
import {uniqueId} from '@eimsnext/form-render-core';
import fcDraggable from 'vuedraggable/src/vuedraggable';

export default defineComponent({
    name: 'SubList',
    components: {fcDraggable, VNode, ConfigItem},
    inject: ['designer'],
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        activeRuleChildren() {
            return this.designer.setupState.activeRuleChildren;
        },
        activeRule() {
            return this.designer.setupState.activeRule;
        },
    },
    methods: {
        toolHandle(...args) {
            this.designer.setupState.toolHandle(...args);
        },
        subRender(...args) {
            return this.designer.setupState.subRender(...args);
        },
        end({oldIndex, newIndex}) {
            if (oldIndex === newIndex) {
                return;
            }
            const rule = this.activeRule.children.splice(oldIndex, 1);
            this.activeRule.children.splice(newIndex, 0, rule[0]);
            this.activeRule.key = uniqueId();
        },
    }

});
</script>

<style>

._fc-sublist ._fc-r-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

._fc-sublist .fc-icon {
    cursor: pointer;
}

._fc-sublist ._fd-config-item + ._fd-config-item {
    margin-top: 8px;
}
</style>
