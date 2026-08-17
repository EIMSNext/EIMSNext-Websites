import { defineComponent, toRef } from "vue";
import { getSlot, hasProperty, is } from "@eimsnext/form-render-core";

const NAME = "fcSelect";
const rawValue = (value) =>
  value && typeof value === "object" ? value.value : value;

export default defineComponent({
  name: NAME,
  inheritAttrs: false,
  props: {
    formCreateInject: Object,
    modelValue: {
      type: [Array, String, Number, Boolean, Object],
      default: undefined,
    },
    type: String,
    multiple: Boolean,
    optionColor: Boolean,
  },
  emits: ["update:modelValue", "fc.el"],
  setup(props) {
    const options = toRef(props.formCreateInject, "options", []);
    const value = toRef(props, "modelValue");
    return {
      options: () => (Array.isArray(options.value) ? options.value : []),
      value,
    };
  },
  render() {
    const makeColorLabel = (option) => {
      const label = option.label ?? option.text ?? option.value ?? "";
      const color = option.color;
      return (
        <span class="fc-select-option-label">
          {this.optionColor && color ? (
            <span
              class="fc-option-color-dot"
              style={{ backgroundColor: color }}
            ></span>
          ) : null}
          <span>{label}</span>
        </span>
      );
    };
    const makeOption = (option, index) => {
      const props = { ...option };
      delete props.color;
      return (
        <ElOption
          {...props}
          key={`${index}-${props.value}`}
          v-slots={{ default: () => makeColorLabel(option) }}
        />
      );
    };
    const makeOptionGroup = (props, index) => (
      <ElOptionGroup label={props.label} key={`${index}-${props.label}`}>
        {is.trueArray(props.options) && props.options.map(makeOption)}
      </ElOptionGroup>
    );
    const options = this.options();
    const findOption = (value) =>
      options.find((option) => rawValue(option) === rawValue(value));
    const selected = this.multiple
      ? Array.isArray(this.value)
        ? this.value[0]
        : undefined
      : this.value;
    const selectedOption = findOption(selected);
    const slots = { ...getSlot(this.$slots, ["default"]) };

    if (this.optionColor && selectedOption?.color) {
      slots.prefix = () => (
        <span
          class="fc-option-color-dot fc-select-prefix-dot"
          style={{ backgroundColor: selectedOption.color }}
        ></span>
      );
    }

    if (this.optionColor && this.multiple) {
      slots.tag = ({ data, deleteTag, selectDisabled }) =>
        data.map((item) => {
          const option = findOption(item.value);
          const color = option?.color;
          return (
            <ElTag
              key={item.value}
              closable={!selectDisabled && !item.isDisabled}
              disableTransitions
              class="fc-select-color-tag"
              style={color ? { backgroundColor: color, borderColor: color, color: "#fff" } : undefined}
              onClose={(event) => deleteTag(event, item)}
            >
              {makeColorLabel(option || item)}
            </ElTag>
          );
        });
    }

    const handleUpdateModelValue = (value) => {
      if (Array.isArray(value)) {
        this.$emit("update:modelValue", [...new Set(value)]);
      } else {
        this.$emit("update:modelValue", value);
      }
    };

    return (
      <ElSelect
        {...this.$attrs}
        multiple={this.multiple}
        modelValue={this.value}
        onUpdate:modelValue={handleUpdateModelValue}
        v-slots={slots}
        ref="el"
      >
        {options.map((option, index) =>
          hasProperty(option || "", "options")
            ? makeOptionGroup(option, index)
            : makeOption(option, index),
        )}
        {this.$slots.default?.()}
      </ElSelect>
    );
  },
  mounted() {
    this.$emit("fc.el", this.$refs.el);
  },
});
