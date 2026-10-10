<template>
    <div class="_fd-tabs-style-select">
        <el-popover
            v-model:visible="visible"
            trigger="click"
            placement="bottom-start"
            :width="260"
            popper-class="_fd-tabs-style-popover"
        >
            <template #reference>
                <div class="_fd-tabs-style-trigger" :class="{active: visible}">
                    <el-tabs
                        :model-value="String(activeIndex)"
                        :type="previewType(currentValue)"
                        class="fc-tabs-enhanced"
                        :style="previewVars"
                    >
                        <el-tab-pane
                            v-for="(label, index) in previewLabels"
                            :key="index"
                            :name="String(index)"
                            :label="label"
                        />
                    </el-tabs>
                    <i class="fc-icon icon-down"></i>
                </div>
            </template>
            <div class="_fd-tabs-style-list">
                <button
                    v-for="item in options"
                    :key="item.value"
                    type="button"
                    class="_fd-tabs-style-option"
                    :class="{active: item.value === currentValue}"
                    :title="item.label"
                    @click="selectStyle(item.value)"
                >
                    <el-tabs
                        :model-value="String(activeIndex)"
                        :type="previewType(item.value)"
                        class="fc-tabs-enhanced"
                        :style="previewVars"
                    >
                        <el-tab-pane
                            v-for="(label, index) in previewLabels"
                            :key="index"
                            :name="String(index)"
                            :label="label"
                        />
                    </el-tabs>
                </button>
            </div>
        </el-popover>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

const DEFAULT_STYLE = 'default';
const PREVIEW_LABEL_LIMIT = 3;

export default defineComponent({
    name: 'TabsStyleSelect',
    inject: ['designer'],
    emits: ['update:modelValue', 'change'],
    props: {
        modelValue: String,
    },
    computed: {
        activeRule() {
            return this.designer?.setupState?.activeRule || {};
        },
        activeProps() {
            return this.activeRule.props || {};
        },
        color() {
            return this.activeProps.tabColorCustom ? this.activeProps.tabColor : '';
        },
        currentValue() {
            return this.modelValue || DEFAULT_STYLE;
        },
        previewVars() {
            return this.color ? {'--fc-tabs-color': this.color} : {};
        },
        // 预览取前 3 个面板标题：面板过多时整行挤满会被截断，看不全反而失真。
        previewLabels() {
            const labels = (this.activeRule.children || [])
                .map((pane) => (pane && pane.props ? pane.props.label : ''))
                .filter(Boolean);
            if (labels.length) {
                return labels.slice(0, PREVIEW_LABEL_LIMIT);
            }
            const t = this.designer?.setupState?.t;
            return Array.from({length: PREVIEW_LABEL_LIMIT}, (_, i) =>
                t ? t('com.tabs.props.tabLabel', [String(i + 1)]) : `标签页${i + 1}`
            );
        },
        activeIndex() {
            const children = this.activeRule.children || [];
            const index = children.findIndex(
                (pane) => pane && pane.props && pane.props.name === this.activeProps.modelValue
            );
            return index > -1 ? Math.min(index, PREVIEW_LABEL_LIMIT - 1) : 0;
        },
    },
    data() {
        return {
            visible: false,
            options: [
                {label: '默认选项卡', value: 'default'},
                {label: '卡片', value: 'card'},
                {label: '带边框卡片', value: 'border-card'},
            ],
        };
    },
    methods: {
        // 官方样式直接映射 el-tabs 的 type；default 不传 type
        previewType(value) {
            return value === 'card' || value === 'border-card' ? value : undefined;
        },
        selectStyle(value) {
            this.$emit('update:modelValue', value);
            this.$emit('change', value);
            this.visible = false;
        },
    },
});
</script>

<style>
._fd-tabs-style-select {
    width: 100%;
}

._fd-tabs-style-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 42px;
    padding: 4px 12px;
    box-sizing: border-box;
    border: 1px solid var(--fc-line-color-2, #dcdfe6);
    border-radius: 4px;
    background: var(--fc-bg-color-1, #fff);
    cursor: pointer;
}

._fd-tabs-style-trigger.active,
._fd-tabs-style-trigger:hover {
    border-color: var(--fc-style-color-1, #4080ff);
}

._fd-tabs-style-trigger > .fc-tabs-enhanced {
    flex: 1;
    min-width: 0;
}

._fd-tabs-style-trigger > i {
    margin-left: 8px;
    color: var(--fc-text-color-1, #606266);
    font-size: 13px;
}

._fd-tabs-style-trigger.active > i {
    transform: rotate(-180deg);
}

._fd-tabs-style-popover {
    padding: 6px !important;
}

._fd-tabs-style-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-right: 2px;
}

._fd-tabs-style-option {
    width: 100%;
    height: 38px;
    padding: 3px 6px;
    box-sizing: border-box;
    border: 1px solid var(--fc-line-color-2, #dcdfe6);
    border-radius: 4px;
    background: var(--fc-bg-color-1, #fff);
    cursor: pointer;
    overflow: hidden;
}

/* 预览用紧凑标签：默认 40px 高的 el-tabs__item 会撑破选项高度，导致选项之间互相遮挡 */
._fd-tabs-style-option .el-tabs__item,
._fd-tabs-style-trigger .el-tabs__item {
    height: 28px;
    line-height: 28px;
    font-size: 12px;
    padding: 0 12px;
}

._fd-tabs-style-option:hover,
._fd-tabs-style-option.active {
    border-color: var(--fc-style-color-1, #4080ff);
}

._fd-tabs-style-trigger .el-tabs__header,
._fd-tabs-style-option .el-tabs__header {
    margin: 0;
}

._fd-tabs-style-trigger .el-tabs__content,
._fd-tabs-style-option .el-tabs__content {
    display: none;
}
</style>
