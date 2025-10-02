<template>
    <div class="_fc-r-tools-bar" v-if="tools.length > 2">
        <div class="_fc-r-tools">
            <template v-for="item in tools" :key="item.icon">
                <el-tooltip
                    effect="dark"
                    :content="item.label"
                    placement="bottom"
                    persistent
                    :hide-after="0"
                >
                    <div class="_fc-r-tool" @click="onClick(item.icon)">
                        <i class="fc-icon" :class="`icon-config-${item.icon}`"></i>
                    </div>
                </el-tooltip>
            </template>
            <div class="_fc-r-tools-close _fc-r-tool" @click="clearActiveRule">
                <i class="fc-icon icon-add2"></i>
            </div>
        </div>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'ToolsBar',
    inject: ['designer'],
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        tools() {
            const vm = this.designer.setupState;
            const tools = [];
            if (!vm.activeRule && !vm.customForm.config) {
                return tools;
            }
            if (vm.baseForm.isShow) {
                tools.push({
                    label: this.t('designer.rule'),
                    icon: 'base'
                })
            }
            if (vm.propsForm.isShow || (vm.customForm.isShow && vm.customForm.propsShow)) {
                tools.push({
                    label: this.t('designer.props'),
                    icon: 'props'
                })
            }
            if (vm.advancedForm.isShow) {
                tools.push({
                    label: this.t('designer.advanced'),
                    icon: 'advanced'
                })
            }
            if (vm.styleForm.isShow) {
                tools.push({
                    label: this.t('designer.style'),
                    icon: 'style'
                })
            }
            if (vm.eventShow) {
                tools.push({
                    label: this.t('designer.event'),
                    icon: 'event'
                })
            }
            if (vm.validateForm.isShow) {
                tools.push({
                    label: this.t('designer.validate'),
                    icon: 'validate'
                })
            }
            return tools;
        },
    },
    methods: {
        onClick(icon) {
            document.querySelector(`#_fd-config-${icon}`).scrollIntoView({
                block: 'start',
                inline: 'nearest',
                behavior: 'smooth'
            })
        },
        clearActiveRule() {
            this.designer.setupState.clearActiveRule();
        },
    }

});
</script>

<style>

._fc-r-tools-bar {
    height: 30px;
}

._fc-r-tools-close {
    position: absolute;
    right: 5px;
    transform: rotate(45deg);
    color: var(--fc-text-color-2);
}

._fc-r-tools {
    display: flex;
    border-top: 1px solid var(--fc-line-color-3);
    position: absolute;
    left: 0;
    right: 0;
    padding: 0 10px;
    align-items: center;
}

._fc-r-tool {
    display: flex;
    width: 28px;
    height: 28px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

._fc-r-tool:hover {
    color: var(--fc-style-color-1);
}

._fc-r-tool .fc-icon {
    font-size: 22px;
}

._fc-r-tools-close .fc-icon {
    font-size: 18px;
}
</style>
