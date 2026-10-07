<template>
    <div class="fc-address" style="width: 100%">
        <el-cascader class="fc-address-cascader" style="width: 100%" :modelValue="areaValue" :options="options"
            :props="{ emitPath: true }" :placeholder="placeholder || placeholderText" clearable filterable
            :disabled="disabled" @update:modelValue="onAreaChange"></el-cascader>
        <el-input v-if="level >= 4" class="fc-address-detail" style="width: 100%; margin-top: 8px" type="textarea"
            :autosize="{ minRows: 3, maxRows: 6 }" :modelValue="detailValue"
            :placeholder="detailPlaceholder || '请填写详细地址'" :disabled="disabled"
            @update:modelValue="onDetailInput"></el-input>
    </div>
</template>

<script>
import { defineComponent, markRaw } from 'vue';

// 内网静态数据：admin/public/area/level.json（同源部署），结构 [{ c, n, d: [{ c, n, d }] }]
const DEFAULT_API = `${import.meta.env?.BASE_URL || '/'}area/level.json`;

const emptyValue = () => ({ province: '', city: '', district: '', detail: '' });

export default defineComponent({
    name: 'FcAddress',
    props: {
        formCreateInject: Object,
        modelValue: {
            type: Object,
            default: () => emptyValue(),
        },
        disabled: Boolean,
        clearable: {
            type: Boolean,
            default: true,
        },
        placeholder: String,
        detailPlaceholder: String,
        filter: Function,
        // 1=省 2=省-市 3=省-市-区 4=省-市-区-详细地址
        level: {
            type: Number,
            default: 4,
        },
        api: String,
    },
    emits: ['update:modelValue', 'change'],
    data() {
        return {
            options: [],
            // 原始数据留着：level（省 / 省-市 / 省-市-区）变化时要按新层级重建选项
            raw: [],
        }
    },
    computed: {
        // 级联面板只展示到 min(level, 3) 级
        areaLevel() {
            return Math.min(Math.max(this.level || 4, 1), 3);
        },
        // 占位文本跟随类型层级：省 / 省-市 / 省-市-区
        placeholderText() {
            return ['省', '省-市', '省-市-区'][this.areaLevel - 1] || '省-市-区';
        },
        areaValue() {
            const value = this.modelValue || {};
            // 只回显当前层级内的部分：层级调浅后不能还显示更深级别的值
            return [value.province, value.city, value.district]
                .slice(0, this.areaLevel)
                .filter(item => !!item);
        },
        detailValue() {
            return this.modelValue?.detail || '';
        },
    },
    watch: {
        // 层级改变要重建选项。之前只在 created() 里构建过一次，
        // 导致改了类型（如 省 → 省-市）下拉仍是旧层级，只能选到省。
        // 只截断显示，不改动已存的值（比层级深的部分仍留在数据里）。
        level() {
            if (this.raw.length) {
                this.buildOptions();
            }
        },
    },
    methods: {
        tidyOptions(list, depth) {
            return (Array.isArray(list) ? list : []).map(item => {
                const option = { value: item.n, label: item.n };
                if (depth > 1 && Array.isArray(item.d) && item.d.length) {
                    option.children = this.tidyOptions(item.d, depth - 1);
                }
                return option;
            });
        },
        buildOptions() {
            // 注意：走 filter 分支时由调用方自行决定层级，不会按 areaLevel 限深（目前无调用方使用 filter）。
            this.options = markRaw(this.filter ? this.filter(this.raw) || [] : this.tidyOptions(this.raw, this.areaLevel));
        },
        loadData(uri) {
            return fetch(uri).then((res) => {
                return res.json();
            }).then((res) => {
                this.raw = markRaw(Array.isArray(res) ? res : []);
                this.buildOptions();
            });
        },
        emitValue(value) {
            const merged = { ...emptyValue(), ...(this.modelValue || {}), ...value };
            this.$emit('update:modelValue', merged);
            this.$emit('change', merged);
        },
        onAreaChange(path) {
            const segments = Array.isArray(path) ? path.filter(item => !!item) : [];
            this.emitValue({
                province: segments[0] || '',
                city: segments[1] || '',
                district: segments[2] || '',
            });
        },
        onDetailInput(detail) {
            this.emitValue({ detail: detail || '' });
        },
    },
    created() {
        if (this.api) {
            this.loadData(this.api);
        } else {
            this.loadData(DEFAULT_API).catch(() => {
                this.loadData('/area/level.json');
            })
        }
    }
});
</script>

<style>
.fc-address {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
}

/* 级联与详细地址同宽 */
.fc-address .fc-address-cascader,
.fc-address .fc-address-detail {
    width: 100%;
    box-sizing: border-box;
}

.fc-address .fc-address-detail {
    margin-top: 8px;
}

.fc-address .fc-address-detail .el-textarea__inner {
    width: 100%;
    box-sizing: border-box;
    min-height: 76px;
}
</style>
