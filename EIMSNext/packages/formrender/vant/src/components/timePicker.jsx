import {computed, defineComponent, ref, toRef} from 'vue';

const NAME = 'fcTimePicker';

export default defineComponent({
    name: NAME,
    inheritAttrs: false,
    props: {
        formCreateInject: Object,
        disabled: Boolean,
        clearable: Boolean,
        placeholder: String,
        modelValue: [String, Number],
        format: String,
        valueFormat: String,
    },
    emits: ['update:modelValue', 'fc.el', 'change'],
    setup(props, _) {
        const show = ref(false);
        const modelValue = toRef(props, 'modelValue');

        const formValue = computed(() => {
            if (modelValue.value == null || modelValue.value === '') {
                return [];
            }
            return String(modelValue.value).split(':');
        });

        const hasSeconds = computed(() =>
            (props.format || props.valueFormat || String(modelValue.value || '')).includes('ss'),
        );
        const columnsType = computed(() =>
            hasSeconds.value ? ['hour', 'minute', 'second'] : ['hour', 'minute'],
        );

        const onInput = (val) => {
            _.emit('update:modelValue', val);
            _.emit('change', val);
        }

        return {
            show,
            formValue,
            columnsType,
            open() {
                if (props.disabled) {
                    return;
                }
                show.value = true;
            },
            confirm({selectedValues}) {
                onInput(selectedValues.join(':'));
                show.value = false;
            },
            clear(e) {
                e.stopPropagation();
                onInput('');
            }
        }
    },
    render() {
        const clearIcon = () => {
            return this.$props.clearable && this.modelValue ?
                <i class="van-badge__wrapper van-icon van-icon-clear van-field__clear"
                    onClick={this.clear}></i> : undefined;
        }
        return <>
            <van-field ref="el" placeholder={this.placeholder} readonly disabled={this.$props.disabled}
                onClick={this.open}
                model-value={this.modelValue} border={false} isLink v-slots={{
                    'right-icon': clearIcon
                }}/>
            <van-popup show={this.show} onUpdate:show={(v) => this.show = v} round position="bottom"
                teleport={this.formCreateInject?.popupContainer ?? undefined}>
                <van-time-picker
                    columnsType={this.columnsType}
                    {...this.$attrs}
                    modelValue={this.formValue}
                    onConfirm={this.confirm}
                    onCancel={() => this.show = false}
                />
            </van-popup>
        </>
    },
    mounted() {
        this.$emit('fc.el', this.$refs.el);
    }
});
