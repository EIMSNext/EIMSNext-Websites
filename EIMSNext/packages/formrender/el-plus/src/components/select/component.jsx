import {defineComponent, toRef} from 'vue';
import {getSlot,is,hasProperty} from '@eimsnext/form-render-core';

const NAME = 'fcSelect';

export default defineComponent({
    name: NAME,
    inheritAttrs: false,
    props: {
        formCreateInject: Object,
        modelValue: {
            type: [Array, String, Number, Boolean, Object],
            default: undefined
        },
        type: String,
    },
    emits: ['update:modelValue', 'fc.el'],
    setup(props) {
        const options = toRef(props.formCreateInject, 'options', []);
        const value = toRef(props, 'modelValue');
        const _options = () => {
            return Array.isArray(options.value) ? options.value : []
        }
        return {
            options: _options,
            value
        }
    },
    render() {
        const makeOption = (props, index) => {
            return <ElOption {...props} key={'' + index + '-' + props.value}/>;
        }
        const makeOptionGroup = (props, index) => {
            return <ElOptionGroup label={props.label}
                key={'' + index + '-' + props.label}>
                {is.trueArray(props.options) && props.options.map((v, index) => {
                    return makeOption(v, index);
                })}
            </ElOptionGroup>;
        }
        const options = this.options();
        
        // 处理多选时的重复值问题
        const handleUpdateModelValue = (v) => {
            // 如果是数组（多选），确保值的唯一性
            if (Array.isArray(v)) {
                // 使用Set去重，保持原有顺序
                const uniqueValues = [...new Set(v)];
                this.$emit('update:modelValue', uniqueValues);
            } else {
                // 单选情况直接传递
                this.$emit('update:modelValue', v);
            }
        };
        
        return <ElSelect {...this.$attrs} modelValue={this.value}
            onUpdate:modelValue={handleUpdateModelValue}
            v-slots={getSlot(this.$slots, ['default'])} ref="el">{options.map((props, index) => {
                return hasProperty(props || '', 'options') ? makeOptionGroup(props, index) : makeOption(props, index);
            })}{this.$slots.default?.()}</ElSelect>;
    },
    mounted() {
        this.$emit('fc.el', this.$refs.el);
    }
});
