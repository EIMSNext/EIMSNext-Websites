import {
  computed,
  defineComponent,
  ref,
  resolveComponent,
  toRef,
  watch,
} from "vue";
import { getFilledTextColor, getSlot } from "@eimsnext/form-render-core";

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
    optionColor: Boolean,
    distribution: {
      type: String,
    },
    direction: String,
  },
  emits: ["update:modelValue", "fc.el"],
  setup(props, _) {
    const injectedOptions = computed(() => props.formCreateInject?.options);
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
      const source = opt.value ?? injectedOptions.value ?? [];
      return Array.isArray(source)
        ? source.map((option) => {
            if (option && typeof option === "object") {
              return {
                ...option,
                value: option.value ?? option.label,
                label: option.label ?? option.value,
              };
            }
            return { value: option, label: option };
          })
        : [];
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
      // Color is presentation-only and must never be persisted as form data.
      if (selectedOption) {
        const { color, ...formValue } = selectedOption;
        _.emit("update:modelValue", formValue);
        return;
      }
      _.emit("update:modelValue", n);
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
    const distribution = this.distribution || this.direction || "horizontal";
    const groupClass = [
      this.$attrs.class,
      "fc-radio-group",
      `fc-radio-group--${distribution}`,
    ];
    return (
      <ElRadioGroup
        {...this.$attrs}
        class={groupClass}
        modelValue={this.computedValue}
        v-slots={getSlot(this.$slots, ["default"])}
        onUpdate:modelValue={this.onInput}
        ref="el"
      >
        {this.options.map((opt, index) => {
          const props = { ...opt };
          const label = props.label;
          const color = props.color;
          delete props.value;
          delete props.label;
          delete props.color;
          // 直接使用value属性作为label和value，确保能够正确比较
          return (
            <Type
              {...props}
              label={opt.value}
              value={opt.value}
              key={name + index + "-" + (opt.value || index)}
            >
              <span
                class={[
                  "fc-option-label",
                  this.optionColor && color ? "is-colored" : "",
                ]}
                style={this.optionColor && color ? { "--fc-option-color": color, "--fc-option-text-color": getFilledTextColor() } : undefined}
              >
                {label || opt.value || ""}
              </span>
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
