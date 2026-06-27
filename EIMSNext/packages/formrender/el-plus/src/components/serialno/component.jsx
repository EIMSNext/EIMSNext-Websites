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
      default: "",
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
    const placeholder = computed(() => props.placeholder || props.formCreateInject?.t("com.serialno.placeholder") || "自动生成,无需填写");
    return () => (
      <el-input
        modelValue={props.modelValue ?? ""}
        placeholder={placeholder.value}
        readonly
        disabled={props.disabled || isPreview.value}
        clearable={false}
        {...attrs}
      />
    );
  },
});
