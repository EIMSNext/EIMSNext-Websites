import {defineComponent, toRef} from 'vue';
import { getFilledTextColor } from '@eimsnext/form-render-core';

const NAME = 'fcRadio';

export default defineComponent({
    name: NAME,
    inheritAttrs: false,
    props: {
        modelValue: [String, Number],
        options: Array,
        distribution: String,
        direction: String,
        formCreateInject: Object,
        optionColor: Boolean,
    },
    emits: ['update:modelValue', 'change'],
    setup(props, _) {
        const modelValue = toRef(props, 'modelValue', []);
        const options = toRef(props, 'options');

        return {
            options,
            modelValue,
            onInput(val) {
                _.emit('update:modelValue', val);
                _.emit('change', val);
            },
        }
    },
    render() {
        const options = this.options || this.formCreateInject?.options || [];
        const direction = (this.distribution || this.direction) === 'vertical' ? 'vertical' : 'horizontal';
        return <van-radio-group direction={direction} {...this.$attrs} modelValue={this.modelValue}
            onUpdate:modelValue={this.onInput}>
            {options.map(opt => {
                const normalized = typeof opt === 'object' ? opt : {label: opt, value: opt};
                const tmp = {...normalized};
                const {text, label, value, color} = normalized;
                delete tmp.text;
                delete tmp.label;
                delete tmp.value;
                delete tmp.color;
                return <van-radio name={value} {...tmp}>
                    <span class={['fc-option-label', this.optionColor && color ? 'is-colored' : '']} style={this.optionColor && color ? {'--fc-option-color': color, '--fc-option-text-color': getFilledTextColor()} : undefined}>
                        {text || label || value}
                    </span>
                </van-radio>
            })}
        </van-radio-group>
    }
});
