import { defineComponent, ref, watch } from "vue";

const DEFAULT_COLOR = "#000000";

export default defineComponent({
  name: "fcColorPicker",
  inheritAttrs: false,
  props: {
    modelValue: String,
    disabled: Boolean,
    clearable: Boolean,
    placeholder: String,
    formCreateInject: Object,
    predefine: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:modelValue", "change", "clear", "fc.el"],
  setup(props, { emit }) {
    const show = ref(false);
    const draft = ref(props.modelValue || "");

    watch(
      () => props.modelValue,
      (value) => {
        if (!show.value) draft.value = value || "";
      },
    );

    const commit = (value) => {
      emit("update:modelValue", value);
      emit("change", value);
      show.value = false;
    };

    const t = (key, fallback) => {
      const translate = props.formCreateInject?.t;
      if (!translate) return fallback;
      const localeKey = `comp.mobileColorPicker.${key}`;
      const value = translate(localeKey);
      return value && value !== localeKey ? value : fallback;
    };

    return {
      show,
      draft,
      open() {
        if (!props.disabled) {
          draft.value = props.modelValue || "";
          show.value = true;
        }
      },
      close() {
        draft.value = props.modelValue || "";
        show.value = false;
      },
      commit,
      t,
      clear(event) {
        event?.stopPropagation?.();
        commit("");
        emit("clear");
      },
    };
  },
  render() {
    const currentColor = this.draft || DEFAULT_COLOR;
    const clearIcon = () =>
      this.clearable && this.modelValue ? (
        <van-icon name="clear" onClick={this.clear} />
      ) : null;

    return (
      <>
        <van-field
          ref="el"
          readonly
          disabled={this.disabled}
          placeholder={this.placeholder}
          modelValue={this.modelValue || ""}
          isLink={false}
          onClick={this.open}
          v-slots={{
            input: () => (
              <span class="fc-color-picker-value">
                {this.modelValue ? (
                  <i
                    class="fc-color-picker-swatch"
                    style={{ backgroundColor: this.modelValue }}
                  />
                ) : null}
                <span>{this.modelValue || this.placeholder}</span>
              </span>
            ),
            "right-icon": clearIcon,
          }}
        />
        <van-popup
          show={this.show}
          onUpdate:show={(value) => {
            if (!value) this.close();
          }}
          round
          position="bottom"
          teleport={this.formCreateInject?.popupContainer ?? undefined}
          class="fc-color-picker-popup"
        >
          <div class="fc-color-picker-header">
            <button type="button" onClick={this.close}>{this.t("cancel", "取消")}</button>
            <strong>{this.t("title", "选择颜色")}</strong>
            <button type="button" onClick={() => this.commit(this.draft)}>{this.t("confirm", "确定")}</button>
          </div>
          <div class="fc-color-picker-body">
            <input
              class="fc-color-picker-input"
              type="color"
              value={currentColor}
              onInput={(event) => (this.draft = event.target.value)}
            />
            <div class="fc-color-picker-presets">
              {this.predefine.map((color) => (
                <button
                  key={color}
                  type="button"
                  class={this.draft === color ? "is-active" : ""}
                  title={color}
                  onClick={() => (this.draft = color)}
                >
                  <i style={{ backgroundColor: color }} />
                </button>
              ))}
            </div>
          </div>
        </van-popup>
      </>
    );
  },
  mounted() {
    this.$emit("fc.el", this.$refs.el);
  },
});
