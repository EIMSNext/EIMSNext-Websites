import {
  computed,
  defineComponent,
  ref,
  resolveComponent,
  toRef,
  watch,
} from "vue";
import { getSlot, toArray } from "@eimsnext/form-render-core";

const NAME = "fcCheckbox";

export default defineComponent({
  name: NAME,
  inheritAttrs: false,
  props: {
    formCreateInject: Object,
    modelValue: {
      type: Array,
      default: () => [],
    },
    type: String,
    options: Array,
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
    const updateCustomValue = (n) => {
      const _value = [...toArray(value.value)];
      // 查找自定义值的索引，处理对象类型
      const idx = _value.findIndex(item => {
        if (typeof item === 'object' && item !== null && typeof customValue.value === 'object' && customValue.value !== null) {
          return item.value === customValue.value.value;
        }
        return item === customValue.value;
      });
      customValue.value = n;
      if (idx > -1) {
        _value.splice(idx, 1);
        _value.push(n);
        onInput(_value);
      }
    };
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

    // 将接收到的对象类型的值数组转换为value值数组，以便Element Plus组件能够正确识别选中的选项
    const computedValue = computed(() => {
      // 处理空值情况，确保value.value是数组
      const values = Array.isArray(value.value) ? value.value : [];
      return values.map(item => {
        return typeof item === 'object' && item !== null ? item.value : item;
      });
    });

    watch(
      value,
      (n) => {
        let customVal = null;
        if (
          !inputValue.value &&
          n != null &&
          Array.isArray(n) &&
          n.length > 0 &&
          input.value
        ) {
          const optionValues = _options.value.map((item) => {
            return item.value;
          });
          n.forEach((val) => {
            // 获取当前值的实际值，如果是对象则取value属性
            const currentValue = typeof val === 'object' && val !== null ? val.value : val;
            if (optionValues.indexOf(currentValue) === -1) {
              customVal = val;
            }
          });
        }
        if (customVal != null) {
          customValue.value = customVal;
        }
      },
      { immediate: true }
    );
    const onInput = (n) => {
      // 根据value数组找到对应的选项对象数组
      const selectedOptions = n.map(val => {
        const option = _options.value.find(opt => opt.value === val);
        return option || val;
      });
      _.emit("update:modelValue", selectedOptions);
    };

    return {
      options: _options,
      value,
      computedValue,
      onInput,
      updateCustomValue,
      makeInput(Type) {
        if (!input.value) {
          return undefined;
        }
        return (
          <Type
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
    const name = this.type === "button" ? "ElCheckboxButton" : "ElCheckbox";
    const Type = resolveComponent(name);
    return (
      <ElCheckboxGroup
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
      </ElCheckboxGroup>
    );
  },
  mounted() {
    this.$emit("fc.el", this.$refs.el);
  },
});
