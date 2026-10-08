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
                        :model-value="'0'"
                        class="fc-tabs-enhanced"
                        :class="'fc-tabs-style-' + currentValue"
                        :style="previewVars"
                    >
                        <el-tab-pane label="标签一" />
                        <el-tab-pane label="标签二" />
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
                        :model-value="'0'"
                        class="fc-tabs-enhanced"
                        :class="'fc-tabs-style-' + item.value"
                        :style="previewVars"
                    >
                        <el-tab-pane label="标签一" />
                        <el-tab-pane label="标签二" />
                    </el-tabs>
                </button>
            </div>
        </el-popover>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

const DEFAULT_STYLE = 'underline';

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
    },
    data() {
        return {
            visible: false,
            options: [
                {label: '胶囊滚动', value: 'pill'},
                {label: '下划线', value: 'underline'},
                {label: '卡片', value: 'card'},
                {label: '描边', value: 'boxed'},
                {label: '填充', value: 'filled'},
                {label: '浅底胶囊', value: 'soft'},
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
    gap: 8px;
    padding-right: 2px;
}

._fd-tabs-style-option {
    width: 100%;
    height: 44px;
    padding: 4px 8px;
    box-sizing: border-box;
    border: 1px solid var(--fc-line-color-2, #dcdfe6);
    border-radius: 4px;
    background: var(--fc-bg-color-1, #fff);
    cursor: pointer;
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
