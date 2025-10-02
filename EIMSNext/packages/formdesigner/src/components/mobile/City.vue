<template>
    <div class="_fc-city-m">
        <van-field ref="el" :placeholder="placeholder" readonly :disabled="disabled"
                   @click="open"
                   :model-value="inputValue" :border="false" isLink>
            <template #right-icon v-if="clearable && inputValue">
                <i class="van-badge__wrapper van-icon van-icon-clear van-field__clear"
                   @click="clear"></i>
            </template>
        </van-field>
        <van-popup :show="show" @update:show="(v) => show = v" round position="bottom">
            <van-cascader
                :modelValue="(modelValue && modelValue[modelValue.length-1]) || ''"
                :options="province"
                @close="show = false"
                @finish="confirm"
            />
        </van-popup>
    </div>
</template>

<script>
import {defineComponent, markRaw} from 'vue';

export default defineComponent({
    name: 'FcCity',
    props: {
        modelValue: Array,
        clearable: Boolean,
        placeholder: String,
        disabled: Boolean,
        filter: Function,
        level: {
            type: Number,
            default: 3
        },
        api: String,
    },
    emits: ['update:modelValue', 'change'],
    data() {
        return {
            inputValue: '',
            show: false,
            province: [],
        }
    },
    watch: {
        modelValue: {
            handler(val) {
                this.inputValue = (val || []).join(' / ');
            },
            deep: true,
            immediate: true,
        }
    },
    computed: {
        city() {
            if (this.value.p) {
                for (let i = 0; i < this.province.length; i++) {
                    if (this.province[i].n === this.value.p) {
                        return this.province[i].d;
                    }
                }
            }
            return [];
        },
        area() {
            if (this.value.c) {
                for (let i = 0; i < this.city.length; i++) {
                    if (this.city[i].n === this.value.c) {
                        return this.city[i]?.d || [];
                    }
                }
            }
            return [];
        }
    },
    methods: {
        open() {
            if (this.disabled) {
                return;
            }
            this.show = true;
        },
        confirm({selectedOptions}) {
            this.inputValue = selectedOptions.map((option) => option.text).join(' / ');
            this.show = false;
            const value = selectedOptions.map((option) => option.value);
            this.$emit('update:modelValue', value);
            this.$emit('change', value);
        },
        clear(e) {
            e.stopPropagation();
            this.inputValue = '';
            this.$emit('update:modelValue', []);
            this.$emit('change', []);
        },
        loadData(uri) {
            return fetch(uri).then((res) => {
                return res.json();
            }).then((res) => {
                this.province = markRaw(this.tidyOptions(this.filter ? this.filter(res) || [] : res, 0));
            });
        },
        tidyOptions(options, level) {
            return options.map(opt => {
                const item = {
                    text: opt.text || opt.n,
                    value: opt.value || opt.text || opt.n
                };
                if ((opt.children || opt.d) && level + 1 < this.level) {
                    item.children = this.tidyOptions(opt.children || opt.d, level + 1);
                }
                return item;
            })
        },
    },
    created() {
        if (this.api) {
            this.loadData(this.api);
        } else {
            this.loadData('https://static.form-create.com/res/level.json').catch(() => {
                this.loadData('https://cdn.jsdelivr.net/npm/@province-city-china/level/level.min.json');
            })
        }
    }
});
</script>

<style>
._fc-city-m {
    width: 100%;
}

._fc-city-m .van-cell {
    padding: 0;
}
</style>

