import {
  computed,
  defineComponent,
  ref,
  resolveComponent,
  toRef,
  watch,
} from "vue";
import { getSlot } from "@eimsnext/form-render-core";

const NAME = "fcRadio";

export default defineComponent({
  name: NAME,
  inheritAttrs: false,
  props: {
    formCreateInject: Object,
    modelValue: {
      type: [String, Number, Boolean, Object],
      default: "",
    },
    options: Array,
    type: String,
    input: Boolean,
    inputValue: String,
  },
  emits: ["update:modelValue", "fc.el"],
  setup(props, _) {
    const options = toRef(props.formCreateInject, "options", []);
    const opt = toRef(props, "options");
    const value = toRef(props, "modelValue");
    const inputValue = toRef(props, "inputValue", "");
    const customValue = ref(inputValue.value);
    const input = toRef(props, "input", false);

    watch(inputValue, (n) => {
      if (!input.value) {
        customValue.value = n;
        return undefined;
      }
      updateCustomValue(n);
    });
    const _options = computed(() => {
      let arr = options.value || [];
      if (opt.value) {
        arr = opt.value || [];
      }
      return Array.isArray(arr) ? arr : [];
    });

    // 将接收到的对象类型的值转换为value值，以便Element Plus组件能够正确识别选中的选项
    const computedValue = computed(() => {
      return typeof value.value === 'object' && value.value !== null ? value.value.value : value.value;
    });

    watch(
      value,
      (n) => {
        let flag = false;
        if (!inputValue.value && n != null && input.value) {
          // 获取当前值的实际值，如果是对象则取value属性
          const currentValue = typeof n === 'object' && n !== null ? n.value : n;
          flag =
            _options.value
              .map((item) => {
                return item.value;
              })
              .indexOf(currentValue) === -1;
        }
        if (flag) {
          customValue.value = n;
        }
      },
      { immediate: true }
    );
    const onInput = (n) => {
      // 根据value值找到对应的选项对象
      const selectedOption = _options.value.find(opt => opt.value === n);
      // 如果找到，返回完整的选项对象，否则返回原始值
      _.emit("update:modelValue", selectedOption || n);
    };
    const updateCustomValue = (n) => {
      const o = customValue.value;
      customValue.value = n;
      if (value.value === o) {
        onInput(n);
      }
    };
    return {
      options: _options,
      value,
      computedValue,
      onInput,
      updateCustomValue,
      customValue,
      makeInput(Type) {
        if (!input.value) {
          return undefined;
        }
        return (
          <Type
            checked={false}
            value={customValue.value || undefined}
            label={customValue.value || undefined}
          >
            <ElInput
              size="small"
              modelValue={customValue.value}
              onUpdate:modelValue={updateCustomValue}
            ></ElInput>
          </Type>
        );
      },
    };
  },
  render() {
    const name = this.type === "button" ? "ElRadioButton" : "ElRadio";
    const Type = resolveComponent(name);
    return (
      <ElRadioGroup
        {...this.$attrs}
        modelValue={this.computedValue}
        v-slots={getSlot(this.$slots, ["default"])}
        onUpdate:modelValue={this.onInput}
        ref="el"
      >
        {this.options.map((opt, index) => {
          const props = { ...opt };
          const label = props.label;
          delete props.value;
          delete props.label;
          // 直接使用value属性作为label和value，确保能够正确比较
          return (
            <Type
              {...props}
              label={opt.value}
              value={opt.value}
              key={name + index + "-" + (opt.value || index)}
            >
              {label || opt.value || ""}
            </Type>
          );
        })}
        {this.$slots.default?.()}
        {this.makeInput(Type)}
      </ElRadioGroup>
    );
  },
  mounted() {
    this.$emit("fc.el", this.$refs.el);
  },
});
