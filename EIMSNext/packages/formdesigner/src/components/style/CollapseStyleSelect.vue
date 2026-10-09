<template>
    <div class="_fd-collapse-style-select">
        <el-popover
            v-model:visible="visible"
            trigger="click"
            placement="bottom-start"
            :width="240"
            popper-class="_fd-collapse-style-popover"
        >
            <template #reference>
                <div class="_fd-collapse-style-trigger" :class="{active: visible}">
                    <el-collapse
                        :model-value="previewTitles.length ? ['0'] : []"
                        class="fc-collapse-enhanced"
                        :class="'fc-collapse-style-' + currentValue"
                        :style="previewVars"
                    >
                        <el-collapse-item
                            v-for="(title, index) in previewTitles"
                            :key="index"
                            :title="title"
                            :name="String(index)"
                        />
                    </el-collapse>
                    <i class="fc-icon icon-down"></i>
                </div>
            </template>
            <div class="_fd-collapse-style-list">
                <button
                    v-for="item in options"
                    :key="item.value"
                    type="button"
                    class="_fd-collapse-style-option"
                    :class="{active: item.value === currentValue}"
                    :title="item.label"
                    @click="selectStyle(item.value)"
                >
                    <el-collapse
                        :model-value="[]"
                        class="fc-collapse-enhanced"
                        :class="'fc-collapse-style-' + item.value"
                        :style="previewVars"
                    >
                        <el-collapse-item
                            v-for="(title, index) in previewTitles"
                            :key="index"
                            :title="title"
                            :name="String(index)"
                        />
                    </el-collapse>
                </button>
            </div>
        </el-popover>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

const DEFAULT_STYLE = 'underline';
const PREVIEW_COUNT = 2;

export default defineComponent({
    name: 'CollapseStyleSelect',
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
            return this.activeProps.collapseColorCustom ? this.activeProps.collapseColor : '';
        },
        currentValue() {
            return this.modelValue || DEFAULT_STYLE;
        },
        previewVars() {
            return this.color ? {'--fc-collapse-color': this.color} : {};
        },
        // 预览标题取自画布真实面板标题，按真实数量渲染，做到「右边下拉 = 左边面板」。
        previewTitles() {
            const titles = (this.activeRule.children || [])
                .map((item) => (item && item.props ? item.props.title : ''))
                .filter(Boolean);
            if (titles.length) {
                return titles;
            }
            const t = this.designer?.setupState?.t;
            return Array.from({length: PREVIEW_COUNT}, (_, i) =>
                t ? t('com.elCollapseItem.name') + (i + 1) : `面板${i + 1}`
            );
        },
    },
    data() {
        return {
            visible: false,
            options: [
                {label: '下划线', value: 'underline'},
                {label: '卡片', value: 'card'},
                {label: '描边', value: 'boxed'},
                {label: '填充', value: 'filled'},
                {label: '胶囊', value: 'pill'},
            ],
        };
    },
    methods: {
        selectStyle(value) {
            this.$emit('update:modelValue', value);
            this.$emit('change', value);
            this.visible = false;
        },
    },
});
</script>

<style>
._fd-collapse-style-select {
    width: 100%;
}

._fd-collapse-style-trigger {
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

._fd-collapse-style-trigger.active,
._fd-collapse-style-trigger:hover {
    border-color: var(--fc-style-color-1, #4080ff);
}

._fd-collapse-style-trigger > .fc-collapse-enhanced {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    pointer-events: none;
}

._fd-collapse-style-trigger > .fc-collapse-enhanced .el-collapse-item__wrap,
._fd-collapse-style-trigger > .fc-collapse-enhanced .el-collapse-item__content {
    display: none;
}

._fd-collapse-style-trigger > .fc-collapse-enhanced .el-collapse-item__header {
    height: 30px;
    line-height: 30px;
    font-size: 12px;
}

._fd-collapse-style-trigger > i {
    margin-left: 8px;
    color: var(--fc-text-color-1, #606266);
    font-size: 13px;
}

._fd-collapse-style-trigger.active > i {
    transform: rotate(-180deg);
}

._fd-collapse-style-popover {
    padding: 6px !important;
}

._fd-collapse-style-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-right: 2px;
}

._fd-collapse-style-option {
    width: 100%;
    padding: 2px 6px;
    box-sizing: border-box;
    border: 1px solid var(--fc-line-color-2, #dcdfe6);
    border-radius: 4px;
    background: var(--fc-bg-color-1, #fff);
    cursor: pointer;
}

._fd-collapse-style-option:hover,
._fd-collapse-style-option.active {
    border-color: var(--fc-style-color-1, #4080ff);
}

._fd-collapse-style-option > .fc-collapse-enhanced {
    pointer-events: none;
}

._fd-collapse-style-option > .fc-collapse-enhanced .el-collapse-item__wrap,
._fd-collapse-style-option > .fc-collapse-enhanced .el-collapse-item__content {
    display: none;
}

._fd-collapse-style-option > .fc-collapse-enhanced .el-collapse-item__header {
    height: 30px;
    line-height: 30px;
    font-size: 12px;
}

._fd-collapse-style-option > .fc-collapse-enhanced .el-collapse-item {
    margin-bottom: 4px;
}

._fd-collapse-style-option > .fc-collapse-enhanced .el-collapse-item:last-child {
    margin-bottom: 0;
}
</style>
