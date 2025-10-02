<template>
    <div class="_fd-display-input">
        <ConfigItem :label="t('style.display.name')" :arrow="false" :showAppend="style.display === 'flex'">
            <el-radio-group :model-value="style.display" size="small" style="width: 150px;">
                <el-tooltip
                    effect="dark"
                    :content="t('style.display.' + item.value)"
                    placement="top"
                    persistent
                    :hide-after="0"
                    v-for="item in displayOptions"
                    :key="item.value"
                >
                    <el-radio-button :label="item.value" :value="item.value" @click="radioClick('display', item)">
                        <i class="fc-icon" :class="'icon-display-' + item.icon"></i>
                    </el-radio-button>

                </el-tooltip>
            </el-radio-group>
            <template #append>
                <div class="_fd-display-con"
                     :class="[style.flexDirection, ['column', 'column-reverse'].indexOf(style.flexDirection) > -1 ? 'rotate-flag' : '']">
                    <div class="_fd-display-raw" v-for="opt in options">
                        <div class="_label">
                            {{ t('style.' + opt.key + '.name') }}:
                        </div>
                        <el-radio-group :model-value="style[opt.key]" size="small">
                            <el-tooltip
                                effect="dark"
                                :content="t('style.' + opt.key + '.' + item.value)"
                                placement="top"
                                persistent
                                :hide-after="0"
                                v-for="item in opt.items"
                                :key="item.value"
                            >
                                <el-radio-button :label="item.value" :value="item.value"
                                                 @click="radioClick(opt.key, item)">
                        <span :class="item.row ? 'rotate' : ''">
                            <i class="fc-icon" :class="'icon-' + item.icon"></i>
                        </span>
                                </el-radio-button>
                            </el-tooltip>
                        </el-radio-group>
                    </div>
                </div>
            </template>
        </ConfigItem>
    </div>
</template>

<script>
import {defineComponent} from 'vue';
import ConfigItem from './ConfigItem.vue';

export default defineComponent({
    name: 'DisplayInput',
    components: {ConfigItem},
    inject: ['designer'],
    emits: ['update:modelValue', 'change'],
    props: {
        modelValue: Object
    },
    watch: {
        modelValue() {
            this.tidyValue();
        },
    },
    computed: {
        t() {
            return this.designer.setupState.t;
        },
    },
    data() {
        return {
            style: {},
            displayOptions: [
                {value: 'block', icon: 'block'},
                {value: 'inline-block', icon: 'inlineblock'},
                {value: 'inline', icon: 'inline'},
                {value: 'flex', icon: 'flex'}
            ],
            options: [
                {
                    key: 'flexDirection',
                    items: [
                        {value: 'row', icon: 'direction-row'},
                        {value: 'column', icon: 'direction-column'},
                        {value: 'row-reverse', icon: 'direction-rowreverse'},
                        {value: 'column-reverse', icon: 'direction-columnreverse'}
                    ]
                },
                {
                    key: 'flexWrap',
                    items: [
                        {value: 'nowrap', icon: 'flex-nowrap', row: true},
                        {value: 'wrap', icon: 'flex-wrap', row: true},
                    ]
                },
                {
                    key: 'alignContent',
                    items: [
                        {value: 'center', icon: 'align-center', row: true},
                        {value: 'flex-start', icon: 'align-flexstart', row: true},
                        {value: 'flex-end', icon: 'align-flexend', row: true},
                        {value: 'space-around', icon: 'align-spacearound', row: true},
                        {value: 'space-between', icon: 'align-spacebetween', row: true},
                        {value: 'stretch', icon: 'align-stretch', row: true}
                    ]
                },
                {
                    key: 'justifyContent',
                    items: [
                        {value: 'center', icon: 'justify-center', row: true},
                        {value: 'flex-start', icon: 'justify-flexstart', row: true},
                        {value: 'flex-end', icon: 'justify-flexend', row: true},
                        {value: 'space-between', icon: 'justify-spacebetween', row: true},
                        {value: 'space-around', icon: 'justify-spacearound', row: true},
                        {value: 'space-evenly', icon: 'justify-stretch', row: true}
                    ]
                },
                {
                    key: 'alignItems',
                    items: [
                        {value: 'center', icon: 'alignitems-center', row: true},
                        {value: 'flex-start', icon: 'alignitems-flexstart', row: true},
                        {value: 'flex-end', icon: 'alignitems-flexend', row: true},
                        {value: 'stretch', icon: 'alignitems-stretch', row: true},
                        {value: 'baseline', icon: 'alignitems-baseline'}
                    ]
                },
            ]
        }
    },
    methods: {
        tidyValue() {
            this.style = {
                display: '',
                flexDirection: '',
                flexWrap: '',
                alignContent: '',
                justifyContent: '',
                alignItems: '',
            };
            if (!this.modelValue) {
                return;
            }
            Object.keys(this.style).forEach(k => {
                if (this.modelValue[k]) {
                    this.style[k] = this.modelValue[k];
                }
            });
        },
        onInput() {
            const style = Object.keys(this.style).reduce((acc, key) => {
                if (this.style[key] !== '') {
                    acc[key] = this.style[key]
                }
                return acc
            }, {});
            this.$emit('update:modelValue', style);
            this.$emit('change', style);
        },
        radioClick(k, item) {
            const old = this.style[k];
            if (this.style[k] === item.value) {
                this.style[k] = '';
            } else {
                if (k === 'display' && item.value !== 'flex') {
                    this.style = {
                        display: item.value,
                        flexDirection: '',
                        flexWrap: '',
                        alignContent: '',
                        justifyContent: '',
                        alignItems: '',
                    };
                } else {
                    this.style[k] = item.value;
                }
            }
            if (this.style[k] !== old) {
                this.onInput();
            }
        }
    },
    created() {
        this.tidyValue();
    }

});
</script>

<style>
._fd-display-input {
    display: flex;
    flex-direction: column;
}

._fd-display-input .el-radio-button__inner {
    width: 100%;
    padding: 4px;
}

._fd-display-input .el-radio-button {
    flex: 1;
}

/*._fd-display-input i {
    color: #000000;
}*/

._fd-display-input .is-active i {
    color: #FFFFFF;
}

._fd-display-input .el-radio-button__inner {
    color: var(--fc-text-color-1);
}

._fd-display-con {
    display: flex;
    flex-wrap: wrap;
}

._fd-display-con.rotate-flag .rotate {
    display: inline-block;
    transform: rotate(-90deg);
}

._fd-display-con.column .icon-justify-flexstart:before {
    transform: rotate(180deg);
    display: inline-block;
}

._fd-display-con.column .icon-justify-flexend:before {
    transform: rotate(0deg);
    display: inline-block;
}

._fd-display-con.row-reverse .icon-justify-flexstart:before {
    transform: rotate(180deg);
    display: inline-block;
}

._fd-display-con.row-reverse .icon-justify-flexend:before {
    transform: rotate(0deg);
    display: inline-block;
}

._fd-display-con.column-reverse .icon-justify-flexstart:before {
    transform: rotate(0deg);
    display: inline-block;
}

._fd-display-con.column-reverse .icon-justify-flexend:before {
    transform: rotate(180deg);
    display: inline-block;
}

._fd-display-raw {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 5px;
}
</style>
