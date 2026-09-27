<template>
    <div class="_fd-divider-style-select">
        <el-popover
            v-model:visible="visible"
            trigger="click"
            placement="bottom-start"
            :width="270"
            popper-class="_fd-divider-style-popover"
        >
            <template #reference>
                <div class="_fd-divider-style-trigger" :class="{active: visible}">
                    <div class="_fd-divider-preview" :class="previewClass(currentValue)" :style="previewVars">
                        <span class="_fd-divider-preview-line before"></span>
                        <span v-if="showTitle" class="_fd-divider-preview-title">{{ previewText }}</span>
                        <span class="_fd-divider-preview-line after"></span>
                        <span class="_fd-divider-preview-decor decor-a"></span>
                        <span class="_fd-divider-preview-decor decor-b"></span>
                    </div>
                    <i class="fc-icon icon-down"></i>
                </div>
            </template>
            <div class="_fd-divider-style-list">
                <button
                    v-for="item in options"
                    :key="item.value"
                    type="button"
                    class="_fd-divider-style-option"
                    :class="{active: item.value === currentValue}"
                    :title="item.label"
                    @click="selectStyle(item.value)"
                >
                    <div class="_fd-divider-preview" :class="previewClass(item.value)" :style="previewVars">
                        <span class="_fd-divider-preview-line before"></span>
                        <span v-if="showTitle" class="_fd-divider-preview-title">{{ previewText }}</span>
                        <span class="_fd-divider-preview-line after"></span>
                        <span class="_fd-divider-preview-decor decor-a"></span>
                        <span class="_fd-divider-preview-decor decor-b"></span>
                    </div>
                </button>
            </div>
        </el-popover>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

const DEFAULT_STYLE = 'solidShort';
const DEFAULT_COLOR = '#C8CDD4';
const DEFAULT_TITLE_COLOR = '#141E31';

export default defineComponent({
    name: 'DividerStyleSelect',
    inject: ['designer'],
    emits: ['update:modelValue', 'change'],
    props: {
        modelValue: String,
        color: String,
        titleColor: String,
        sampleText: {
            type: String,
            default: '字段标题',
        },
    },
    computed: {
        activeRule() {
            return this.designer?.setupState?.activeRule || {};
        },
        activeProps() {
            return this.activeRule.props || {};
        },
        showTitle() {
            return !this.activeRule.wrap || this.activeRule.wrap.title !== false;
        },
        previewText() {
            if (!this.showTitle) {
                return '';
            }
            const child = this.activeRule.children && this.activeRule.children[0];
            return child || this.sampleText;
        },
        currentValue() {
            return this.modelValue || DEFAULT_STYLE;
        },
        previewVars() {
            return {
                '--fd-divider-color': this.color || this.activeProps.dividerColor || DEFAULT_COLOR,
                '--fd-divider-title-color': this.titleColor || this.activeProps.dividerTitleColor || DEFAULT_TITLE_COLOR,
            };
        },
    },
    data() {
        return {
            visible: false,
            options: [
                {label: 'Plain', value: 'plain'},
                {label: 'Dash', value: 'dash'},
                {label: 'Solid short', value: 'solidShort'},
                {label: 'Solid full', value: 'solidFull'},
                {label: 'Ribbon slash', value: 'ribbonSlash'},
                {label: 'Pill short', value: 'pillShort'},
                {label: 'Pill fill', value: 'pillFill'},
                {label: 'Side bar', value: 'sideBar'},
                {label: 'Slash gradient', value: 'slashGradient'},
                {label: 'Arrow line', value: 'arrowLine'},
                {label: 'Center chevrons', value: 'centerChevrons'},
                {label: 'Center tab', value: 'centerTab'},
                {label: 'Diamond line', value: 'diamondLine'},
            ],
        };
    },
    methods: {
        previewClass(value) {
            return ['is-' + value, {'is-no-title': !this.showTitle}];
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
._fd-divider-style-select {
    width: 100%;
}

._fd-divider-style-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 42px;
    padding: 6px 12px;
    box-sizing: border-box;
    border: 1px solid var(--fc-line-color-2);
    border-radius: 4px;
    background: var(--fc-bg-color-1);
    cursor: pointer;
}

._fd-divider-style-trigger.active,
._fd-divider-style-trigger:hover {
    border-color: var(--fc-style-color-1);
}

._fd-divider-style-trigger > i {
    margin-left: 8px;
    color: var(--fc-text-color-1);
    font-size: 13px;
}

._fd-divider-style-trigger.active > i {
    transform: rotate(-180deg);
}

._fd-divider-style-popover {
    padding: 6px !important;
}

._fd-divider-style-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 342px;
    overflow-y: auto;
    padding-right: 2px;
}

._fd-divider-style-option {
    width: 100%;
    height: 50px;
    padding: 6px 8px;
    border: 1px solid var(--fc-line-color-2);
    border-radius: 4px;
    background: var(--fc-bg-color-1);
    cursor: pointer;
    text-align: left;
}

._fd-divider-style-option:hover,
._fd-divider-style-option.active {
    border-color: var(--fc-style-color-1);
}

._fd-divider-preview {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: 30px;
    overflow: hidden;
    color: var(--fd-divider-title-color);
    font-size: 13px;
    font-weight: 600;
    line-height: 1;
}

._fd-divider-preview-title {
    position: relative;
    z-index: 2;
    white-space: nowrap;
}

._fd-divider-preview-line {
    display: block;
    height: 2px;
    background: var(--fd-divider-color);
}

._fd-divider-preview-line.before {
    display: none;
}

._fd-divider-preview-line.after {
    flex: 1;
    margin-left: 8px;
}

._fd-divider-preview-decor {
    position: absolute;
    display: none;
}

._fd-divider-preview.is-plain ._fd-divider-preview-line {
    display: none;
}

._fd-divider-preview.is-dash ._fd-divider-preview-line.after {
    height: 1px;
    background: repeating-linear-gradient(90deg, var(--fd-divider-color) 0 4px, transparent 4px 7px);
}

._fd-divider-preview.is-solidShort ._fd-divider-preview-line.after {
    flex: 0 0 55%;
    height: 1px;
}

._fd-divider-preview.is-solidFull {
    align-items: flex-end;
    padding-bottom: 5px;
    box-sizing: border-box;
}

._fd-divider-preview.is-solidFull ._fd-divider-preview-title {
    align-self: center;
}

._fd-divider-preview.is-solidFull ._fd-divider-preview-line.after {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 3px;
    height: 2px;
    margin-left: 0;
}

._fd-divider-preview.is-ribbonSlash ._fd-divider-preview-title {
    padding: 8px 46px 8px 12px;
    background: var(--fd-divider-color);
}

._fd-divider-preview.is-ribbonSlash ._fd-divider-preview-line.after {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 2px;
    height: 2px;
    margin-left: 0;
}

._fd-divider-preview.is-ribbonSlash .decor-a {
    display: block;
    left: 82px;
    top: 4px;
    width: 36px;
    height: 22px;
    background: repeating-linear-gradient(70deg, rgba(255, 255, 255, 0.85) 0 6px, transparent 6px 12px);
}

._fd-divider-preview.is-ribbonSlash.is-no-title .decor-a {
    left: 8px;
}

._fd-divider-preview.is-pillShort ._fd-divider-preview-line.after {
    position: absolute;
    left: 0;
    right: 6px;
    bottom: 5px;
    height: 4px;
    margin-left: 0;
    opacity: 0.28;
}

._fd-divider-preview.is-pillShort .decor-a {
    display: block;
    left: 0;
    bottom: 5px;
    width: 58px;
    height: 8px;
    border-radius: 8px;
    background: var(--fd-divider-color);
}

._fd-divider-preview.is-pillFill {
    background: color-mix(in srgb, var(--fd-divider-color) 22%, transparent);
}

._fd-divider-preview.is-pillFill ._fd-divider-preview-title {
    padding: 10px 24px;
    border-radius: 0 14px 14px 0;
    background: var(--fd-divider-color);
}

._fd-divider-preview.is-pillFill ._fd-divider-preview-line {
    display: none;
}

._fd-divider-preview.is-pillFill.is-no-title::before {
    position: absolute;
    left: 0;
    top: 50%;
    width: 72px;
    height: 16px;
    border-radius: 0 12px 12px 0;
    background: var(--fd-divider-color);
    content: "";
    transform: translateY(-50%);
}

._fd-divider-preview.is-sideBar ._fd-divider-preview-title {
    padding-left: 10px;
}

._fd-divider-preview.is-sideBar ._fd-divider-preview-line {
    display: none;
}

._fd-divider-preview.is-sideBar .decor-a {
    display: block;
    left: 0;
    top: 7px;
    width: 4px;
    height: 16px;
    background: var(--fd-divider-color);
}

._fd-divider-preview.is-slashGradient ._fd-divider-preview-title {
    padding: 7px 12px 7px 18px;
    background: linear-gradient(90deg, var(--fd-divider-color), color-mix(in srgb, var(--fd-divider-color) 12%, transparent));
    transform: skewX(-12deg);
}

._fd-divider-preview.is-slashGradient ._fd-divider-preview-title::first-letter {
    transform: skewX(12deg);
}

._fd-divider-preview.is-slashGradient ._fd-divider-preview-line {
    display: none;
}

._fd-divider-preview.is-slashGradient .decor-a {
    display: block;
    left: 4px;
    top: 4px;
    width: 4px;
    height: 22px;
    background: var(--fd-divider-color);
    transform: skewX(-12deg);
}

._fd-divider-preview.is-slashGradient.is-no-title::before {
    position: absolute;
    left: 10px;
    top: 5px;
    width: 104px;
    height: 20px;
    background: linear-gradient(90deg, var(--fd-divider-color), color-mix(in srgb, var(--fd-divider-color) 12%, transparent));
    content: "";
    transform: skewX(-12deg);
}

._fd-divider-preview.is-arrowLine ._fd-divider-preview-title {
    padding-left: 18px;
}

._fd-divider-preview.is-arrowLine ._fd-divider-preview-line.after {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 3px;
    height: 1px;
    margin-left: 0;
}

._fd-divider-preview.is-arrowLine .decor-a {
    display: block;
    left: 0;
    top: 9px;
    width: 10px;
    height: 10px;
    border-top: 2px solid var(--fd-divider-color);
    border-right: 2px solid var(--fd-divider-color);
    transform: rotate(45deg);
}

._fd-divider-preview.is-arrowLine .decor-b {
    display: block;
    right: 0;
    bottom: 2px;
    width: 38px;
    height: 4px;
    background: repeating-linear-gradient(110deg, var(--fd-divider-color) 0 2px, transparent 2px 5px);
}

._fd-divider-preview.is-centerChevrons {
    justify-content: center;
    text-align: center;
}

._fd-divider-preview.is-centerChevrons ._fd-divider-preview-title {
    padding: 0 24px;
}

._fd-divider-preview.is-centerChevrons ._fd-divider-preview-line {
    display: none;
}

._fd-divider-preview.is-centerChevrons .decor-a,
._fd-divider-preview.is-centerChevrons .decor-b {
    display: block;
    top: 10px;
    width: 28px;
    height: 10px;
    color: var(--fd-divider-color);
    font-size: 16px;
    line-height: 10px;
}

._fd-divider-preview.is-centerChevrons .decor-a {
    left: calc(50% - 76px);
}

._fd-divider-preview.is-centerChevrons .decor-a::before {
    content: "<<<";
}

._fd-divider-preview.is-centerChevrons .decor-b {
    right: calc(50% - 76px);
}

._fd-divider-preview.is-centerChevrons .decor-b::before {
    content: ">>>";
}

._fd-divider-preview.is-centerChevrons.is-no-title .decor-a {
    left: calc(50% - 34px);
}

._fd-divider-preview.is-centerChevrons.is-no-title .decor-b {
    right: calc(50% - 34px);
}

._fd-divider-preview.is-centerTab {
    justify-content: center;
    background: color-mix(in srgb, var(--fd-divider-color) 18%, transparent);
    border-radius: 14px 14px 0 0;
}

._fd-divider-preview.is-centerTab ._fd-divider-preview-title {
    min-width: 104px;
    padding: 8px 18px;
    box-sizing: border-box;
    text-align: center;
    background: var(--fd-divider-color);
    clip-path: polygon(8% 0, 92% 0, 100% 100%, 0 100%);
}

._fd-divider-preview.is-centerTab ._fd-divider-preview-line {
    display: none;
}

._fd-divider-preview.is-centerTab.is-no-title::before {
    position: absolute;
    left: 50%;
    top: 3px;
    width: 112px;
    height: 24px;
    background: var(--fd-divider-color);
    clip-path: polygon(8% 0, 92% 0, 100% 100%, 0 100%);
    content: "";
    transform: translateX(-50%);
}

._fd-divider-preview.is-diamondLine {
    justify-content: center;
}

._fd-divider-preview.is-diamondLine ._fd-divider-preview-title {
    padding: 0 28px;
}

._fd-divider-preview.is-diamondLine ._fd-divider-preview-line {
    display: block;
    flex: 1;
    height: 1px;
    margin: 0;
}

._fd-divider-preview.is-diamondLine ._fd-divider-preview-line.after {
    margin-left: 0;
}

._fd-divider-preview.is-diamondLine .decor-a,
._fd-divider-preview.is-diamondLine .decor-b {
    display: block;
    top: 9px;
    width: 12px;
    height: 12px;
    background: var(--fd-divider-color);
    transform: rotate(45deg);
}

._fd-divider-preview.is-diamondLine .decor-a {
    left: calc(50% - 62px);
}

._fd-divider-preview.is-diamondLine .decor-b {
    right: calc(50% - 62px);
}

._fd-divider-preview.is-no-title ._fd-divider-preview-line.after {
    margin-left: 0;
}

._fd-divider-preview.is-diamondLine.is-no-title .decor-a {
    left: calc(50% - 20px);
}

._fd-divider-preview.is-diamondLine.is-no-title .decor-b {
    right: calc(50% - 20px);
}
</style>
