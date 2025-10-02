<template>
    <div class="_fd-slots-config">
        <template v-for="(item, key) in easySlots">
            <ConfigItem :label="item.label">
                <el-input size="small" v-model="item.value" clearable @blur="onChange">
                    <template #prepend v-if="!item.only">
                        <el-select size="small" v-model="item.type" @change="changeType(item)">
                            <template v-for="name in type">
                                <el-option :label="t('props.' + name)" :value="name"/>
                            </template>
                        </el-select>
                    </template>
                    <template #append v-if="item.type === 'icon'">
                        <el-popover :ref="key" placement="bottom" popper-class="_fd-slots-config-pop" :width="400"
                                    trigger="click">
                            <div class="_fd-slots-icons">
                                <template v-for="name in icons">
                                    <div class="_fd-slots-icon" @click="changeIcon(item, name, key)">
                                        <i class="fc-icon iconfont" :class="name"></i>
                                    </div>
                                </template>
                            </div>
                            <template #reference>
                                <i class="fc-icon icon-menu"></i>
                            </template>
                        </el-popover>
                    </template>
                </el-input>
            </ConfigItem>
        </template>
    </div>
</template>

<script>
import {defineComponent} from 'vue';
import { uniqueId } from "@eimsnext/form-render-core";
import ConfigItem from './style/ConfigItem.vue';
import {uniqueArray} from '../utils';

export default defineComponent({
    name: 'SlotsConfig',
    inject: ['designer'],
    components: {ConfigItem},
    data() {
        return {
            type: ['icon', 'text'],
            easySlots: {}
        }
    },
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        slots() {
            const menu = this.designer.setupState?.activeRule?._menu || {};
            const slots = menu.easySlots || [];
            return slots.map(slot => {
                if (typeof slot === 'string') {
                    return {
                        value: slot,
                        label: this.t('com.' + menu.name + '.slots.' + slot) || this.t('slots.' + slot) || this.t('props.' + slot) || slot,
                    }
                } else {
                    const item = {...slot};
                    if (!item.label) {
                        item.label = this.t('com.' + menu.name + '.slots.' + slot.value) || this.t('slots.' + slot.value) || this.t('props.' + slot.value) || slot.value;
                    }
                    return item;
                }

            })
        },
        modelValue() {
            return this.designer.setupState?.activeRule?.$easySlots || {};
        },
        icons() {
            return uniqueArray([
                ...this.designer.setupState.getConfig('icons', []),
                'icon-layout',
                'icon-column1',
                'icon-column2',
                'icon-column3',
                'icon-column4',
                'icon-tab',
                'icon-config-event',
                'icon-step-form',
                'icon-slider',
                'icon-dialog',
                'icon-justify-spacearound',
                'icon-upload',
                'icon-copy',
                'icon-time-range',
                'icon-task-add',
                'icon-justify-spacebetween',
                'icon-import',
                'icon-config-base',
                'icon-alignitems-stretch',
                'icon-alignitems-flexend',
                'icon-check',
                'icon-auto',
                'icon-calendar',
                'icon-config-style',
                'icon-config-advanced',
                'icon-config-props',
                'icon-delete-circle2',
                'icon-delete-circle',
                'icon-delete',
                'icon-direction-rowreverse',
                'icon-display-flex',
                'icon-drag',
                'icon-display-block',
                'icon-data',
                'icon-edit2',
                'icon-edit',
                'icon-add-col',
                'icon-display-inlineblock',
                'icon-config-validate',
                'icon-down',
                'icon-display-inline',
                'icon-eye',
                'icon-eye-close',
                'icon-preview',
                'icon-flex-nowrap',
                'icon-folder',
                'icon-form-circle',
                'icon-flex-wrap',
                'icon-form',
                'icon-form-item',
                'icon-icon',
                'icon-image',
                'icon-justify-flexstart',
                'icon-justify-center',
                'icon-justify-stretch',
                'icon-link2',
                'icon-minus',
                'icon-menu2',
                'icon-more',
                'icon-menu',
                'icon-language',
                'icon-pad',
                'icon-mobile',
                'icon-page-max',
                'icon-move',
                'icon-page-min',
                'icon-pre-step',
                'icon-pc',
                'icon-page',
                'icon-refresh',
                'icon-radius',
                'icon-save-filled',
                'icon-question',
                'icon-scroll',
                'icon-script',
                'icon-setting',
                'icon-save',
                'icon-shadow',
                'icon-variable',
                'icon-yes',
                'icon-shadow-inset',
                'icon-date',
                'icon-date-range',
                'icon-collapse',
                'icon-switch',
                'icon-subform',
                'icon-tree-select',
                'icon-value',
                'icon-alert',
                'icon-card',
                'icon-checkbox',
                'icon-cascader',
                'icon-button',
                'icon-data-table',
                'icon-group',
                'icon-divider',
                'icon-flex',
                'icon-descriptions',
                'icon-html',
                'icon-editor',
                'icon-input',
                'icon-link',
                'icon-password',
                'icon-radio',
                'icon-row',
                'icon-inline',
                'icon-rate',
                'icon-color',
                'icon-select',
                'icon-json',
                'icon-number',
                'icon-space',
                'icon-table-form',
                'icon-table-form2',
                'icon-time',
                'icon-span',
                'icon-textarea',
                'icon-tooltip',
                'icon-slot',
                'icon-transfer',
                'icon-tag',
                'icon-watermark',
                'icon-tree',
                'icon-table',
                'icon-add-child',
                'icon-add2',
                'icon-add',
                'icon-alignitems-baseline',
                'icon-add-circle',
                'icon-alignitems-center'
            ]);
        }
    },
    watch: {
        modelValue: {
            handler: function (val) {
                const easySlots = {};
                this.slots.forEach(({value, label, type}) => {
                    if (val[value]) {
                        easySlots[value] = {...val[value]};
                    } else if (this.easySlots[value]) {
                        easySlots[value] = {
                            type: this.easySlots[value].type,
                        };
                    } else {
                        easySlots[value] = {
                            type: type || 'icon',
                            value: '',
                        };
                    }
                    easySlots[value].only = type;
                    easySlots[value].label = label;
                })
                this.easySlots = easySlots;
            },
            immediate: true,
        }
    },
    methods: {
        changeIcon(item, icon, key) {
            item.value = icon;
            this.onChange();
            this.$refs[key][0].hide();
        },
        changeType(item) {
            if (item.value) {
                item.value = '';
                this.onChange();
            }
        },
        onChange() {
            if (this.designer.setupState?.activeRule) {
                const easySlots = {};
                Object.keys(this.easySlots).forEach(key => {
                    if (this.easySlots[key].value) {
                        easySlots[key] = {...this.easySlots[key]};
                        delete easySlots[key].label;
                        delete easySlots[key].only;
                    }
                })
                if (Object.keys(easySlots).length === 0) {
                    delete this.designer.setupState.activeRule.$easySlots;
                } else {
                    this.designer.setupState.activeRule.$easySlots = easySlots;
                }
                this.designer.setupState.activeRule.key = uniqueId();
            }
        }
    },
    mounted() {
    }

});
</script>

<style>
._fd-slots-config .el-input {
    width: 170px;
    min-width: 170px;
    margin-left: 5px;
}

._fd-slots-config .el-select {
    width: 60px;
}

._fd-slots-config .el-select input, ._fd-slots-config .fc-icon {
    cursor: pointer;
}

._fd-slots-config .el-input-group__append {
    padding: 0 5px;
}

._fd-slots-icons {
    display: grid;
    grid-template-columns: repeat(13, 1fr);
    width: 100%;
    grid-gap: 10px;
}

._fd-slots-icon {
    text-align: center;
    color: var(--fc-text-color-1);
    cursor: pointer;
}

._fd-slots-config-pop {
    max-height: 320px;
    overflow: auto;
}
</style>
