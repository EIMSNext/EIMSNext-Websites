import { defineComponent, computed } from "vue";

export default defineComponent({
  name: "fcSerialNo",
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number],
      default: "",
    },
    placeholder: {
      type: String,
      default: "自动生成,无需填写",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    preview: {
      type: Boolean,
      default: undefined,
    },
    segments: {
      type: Array,
      default: () => [],
    },
    formCreateInject: {
      type: Object,
      default: null,
    },
  },
  setup(props, { attrs }) {
    const isPreview = computed(() =>
      props.preview !== undefined
        ? !!props.preview
        : !!props.formCreateInject?.preview
    );
    return () => (
      <el-input
        modelValue={props.modelValue ?? ""}
        placeholder={props.placeholder}
        readonly
        disabled={props.disabled || isPreview.value}
        clearable={false}
        {...attrs}
      />
    );
  },
});
