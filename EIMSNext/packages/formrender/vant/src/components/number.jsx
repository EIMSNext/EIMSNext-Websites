import { defineComponent } from "vue";

export default defineComponent({
  name: "fcNumber",
  inheritAttrs: false,
  props: {
    modelValue: [Number, String],
    disabled: Boolean,
    readonly: Boolean,
    controls: {
      type: Boolean,
      default: true,
    },
    min: Number,
    max: Number,
    step: {
      type: Number,
      default: 1,
    },
    precision: Number,
  },
  emits: ["update:modelValue", "change", "fc.el"],
  render() {
    return (
      <van-stepper
        ref="el"
        {...this.$attrs}
        modelValue={this.modelValue}
        disabled={this.disabled}
        disableInput={this.readonly}
        showPlus={this.controls}
        showMinus={this.controls}
        min={this.min}
        max={this.max}
        step={this.step}
        decimalLength={this.precision}
        allowEmpty
        onUpdate:modelValue={(value) => this.$emit("update:modelValue", value)}
        onChange={(value) => this.$emit("change", value)}
      />
    );
  },
  mounted() {
    this.$emit("fc.el", this.$refs.el);
  },
});
