import {defineComponent, ref, toRef, watch} from 'vue';

const NAME = 'fcAddress';

// 内网静态数据：admin/public/area/level.json（同源部署），结构 [{ c, n, d: [{ c, n, d }] }]
const DEFAULT_API = `${import.meta.env?.BASE_URL || '/'}area/level.json`;

const emptyValue = () => ({province: '', city: '', district: '', detail: ''});

export default defineComponent({
    name: NAME,
    inheritAttrs: false,
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
    emits: ['update:modelValue', 'change', 'fc.el'],
    setup(props, _) {
        const raw = ref([]);
        const options = ref([]);
        const show = ref(false);
        const modelValue = toRef(props, 'modelValue');

        const areaValue = ref('');
        const inputValue = ref('');
        // 暂存最近一次选择（含父级），供底部「确定」按钮提交任意层级
        const pending = ref([]);

        const areaLevel = () => Math.min(Math.max(props.level || 4, 1), 3);

        // 原始数据 { n, d } → vant Cascader 的 { text, value, children }，按 level 截断层级
        const tidyOptions = (list, depth) =>
            (Array.isArray(list) ? list : []).map((item) => {
                const option = {
                    text: item.text || item.n,
                    value: item.value || item.text || item.n,
                };
                if (depth > 1 && Array.isArray(item.d) && item.d.length) {
                    option.children = tidyOptions(item.d, depth - 1);
                }
                return option;
            });

        const loadData = (uri) =>
            fetch(uri)
                .then((res) => res.json())
                .then((res) => {
                    raw.value = props.filter ? props.filter(res) || [] : res;
                    options.value = tidyOptions(raw.value, areaLevel());
                });

        const syncFromModel = (val) => {
            const value = val || {};
            const segments = [value.province, value.city, value.district].filter(item => !!item);
            areaValue.value = segments.length ? segments[segments.length - 1] : '';
            inputValue.value = segments.join(' / ');
        };

        watch(() => modelValue.value, syncFromModel, {deep: true, immediate: true});

        watch(() => props.level, () => {
            if (raw.value.length) {
                options.value = tidyOptions(raw.value, areaLevel());
            }
        });

        const emitValue = (value) => {
            const merged = {...emptyValue(), ...(modelValue.value || {}), ...value};
            _.emit('update:modelValue', merged);
            _.emit('change', merged);
        };

        return {
            show,
            options,
            inputValue,
            areaValue,
            pending,
            loadData,
            open() {
                if (props.disabled) {
                    return;
                }
                show.value = true;
            },
            // 每次选择（含父级展开）都暂存当前路径，便于只选部分层级
            onChange({selectedOptions}) {
                pending.value = selectedOptions || [];
            },
            confirm({selectedOptions}) {
                show.value = false;
                syncFromModel({
                    province: selectedOptions[0]?.text || '',
                    city: selectedOptions[1]?.text || '',
                    district: selectedOptions[2]?.text || '',
                });
                emitValue({
                    province: selectedOptions[0]?.text || '',
                    city: selectedOptions[1]?.text || '',
                    district: selectedOptions[2]?.text || '',
                });
            },
            // 底部「确定」：提交当前暂存的任意层级（省 / 省市 / 市区），未选则仅关闭
            confirmPending() {
                const opts = pending.value || [];
                if (!opts.length) {
                    show.value = false;
                    return;
                }
                this.confirm({selectedOptions: opts});
            },
            clear(e) {
                e.stopPropagation();
                syncFromModel(emptyValue());
                emitValue(emptyValue());
            },
            onDetailInput(detail) {
                emitValue({detail: detail || ''});
            },
            // 清除按钮 + 箭头都渲染在输入框行内（.van-field__body），
            // 不用 isLink 的 cell 右侧箭头 —— 那个箭头会被字段布局样式挤到下一行。
            renderRightIcons() {
                const icons = [];
                if (props.clearable && inputValue.value) {
                    icons.push(
                        <i class="van-badge__wrapper van-icon van-icon-clear van-field__clear"
                            onClick={this.clear}></i>
                    );
                }
                icons.push(<van-icon class="fc-address-arrow" name="arrow"/>);
                return icons;
            },
        };
    },
    created() {
        const uri = this.api || DEFAULT_API;
        this.loadData(uri).catch(() => {
            if (uri !== '/area/level.json') {
                this.loadData('/area/level.json');
            }
        });
    },
    render() {
        return <>
            <van-field ref="el" class="fc-address-picker" placeholder={this.placeholder || '省-市-区'} readonly
                disabled={this.$props.disabled}
                onClick={this.open}
                model-value={this.inputValue} border={false} v-slots={{
                'right-icon': () => this.renderRightIcons()
            }}/>
            <van-popup show={this.show} onUpdate:show={(v) => this.show = v} round position="bottom"
                teleport={this.formCreateInject?.popupContainer ?? undefined}>
                <van-cascader
                    modelValue={this.areaValue}
                    options={this.options}
                    onClose={() => this.show = false}
                    onFinish={this.confirm}
                    onChange={this.onChange}
                />
                <div class="fc-mobile-popup-footer">
                    <van-button block type="primary" onClick={this.confirmPending}>确定</van-button>
                </div>
            </van-popup>
            {this.$props.level >= 4 && <van-field class="fc-address-detail"
                modelValue={this.modelValue?.detail || ''}
                onUpdate:modelValue={this.onDetailInput}
                type="textarea" rows={3} autosize border={false}
                placeholder={this.detailPlaceholder || '请填写详细地址'} disabled={this.$props.disabled}/>}
        </>
    },
    mounted() {
        this.$emit('fc.el', this.$refs.el);
    }
});
