import { computed, defineComponent, ref, toRef } from "vue";

const NAME = "fcSelect";

const optionValue = (option) =>
  option && typeof option === "object" ? option.value : option;

const optionLabel = (option) => {
  if (option && typeof option === "object") {
    return option.label ?? option.text ?? option.value ?? "";
  }
  return option ?? "";
};

const modelValue = (value) =>
  value && typeof value === "object" ? value.value : value;

const flattenOptions = (options) =>
  (Array.isArray(options) ? options : []).flatMap((option) =>
    Array.isArray(option?.options) ? option.options : [option],
  );

export default defineComponent({
  name: NAME,
  inheritAttrs: false,
  props: {
    formCreateInject: Object,
    disabled: Boolean,
    clearable: Boolean,
    filterable: Boolean,
    multiple: Boolean,
    multipleLimit: Number,
    placeholder: String,
    modelValue: {
      type: [Array, String, Number, Boolean, Object],
      default: undefined,
    },
    options: Array,
  },
  emits: ["update:modelValue", "change", "clear", "fc.el"],
  setup(props, { emit }) {
    const show = ref(false);
    const keyword = ref("");
    const value = toRef(props, "modelValue");
    const sourceOptions = computed(() => {
      const injected = props.formCreateInject?.options;
      const rule = props.formCreateInject?.rule;
      const remote = !!(
        rule?.effect?.fetch ||
        rule?.effect?.source ||
        rule?.$fetch ||
        rule?.$source
      );
      if (remote) return flattenOptions(injected ?? []);
      const options =
        Array.isArray(injected) && injected.length
          ? injected
          : props.options ?? injected ?? [];
      return flattenOptions(options);
    });
    const filteredOptions = computed(() => {
      const word = keyword.value.trim().toLocaleLowerCase();
      if (!word) return sourceOptions.value;
      return sourceOptions.value.filter((option) =>
        String(optionLabel(option)).toLocaleLowerCase().includes(word),
      );
    });
    const selectedValues = computed(() => {
      const values = props.multiple
        ? Array.isArray(value.value)
          ? value.value
          : value.value == null || value.value === ""
            ? []
            : [value.value]
        : [value.value];
      return values
        .map(modelValue)
        .filter(
          (item) => item !== undefined && item !== null && item !== "",
        );
    });
    const displayValue = computed(() => {
      const labels = selectedValues.value.map((selected) => {
        const option = sourceOptions.value.find(
          (item) => optionValue(item) === selected,
        );
        if (option) return optionLabel(option);
        const original = props.multiple
          ? (Array.isArray(value.value) ? value.value : []).find(
              (item) => modelValue(item) === selected,
            )
          : value.value;
        return optionLabel(original ?? selected);
      });
      return labels.filter((item) => item !== "").join(", ");
    });

    const updateValue = (next) => {
      emit("update:modelValue", next);
      emit("change", next);
    };

    const clear = (event) => {
      event?.stopPropagation?.();
      const next = props.multiple ? [] : "";
      updateValue(next);
      emit("clear");
    };

    const toggleMultiple = (next) => {
      const unique = [...new Set(next)];
      if (props.multipleLimit > 0 && unique.length > props.multipleLimit) return;
      updateValue(unique);
    };

    return {
      show,
      keyword,
      filteredOptions,
      selectedValues,
      displayValue,
      open() {
        if (!props.disabled) {
          keyword.value = "";
          show.value = true;
        }
      },
      clear,
      toggleMultiple,
      selectOne(option) {
        updateValue(optionValue(option));
        show.value = false;
      },
      optionValue,
      optionLabel,
    };
  },
  render() {
    const clearIcon = () =>
      this.clearable && this.displayValue ? (
        <van-icon name="clear" onClick={this.clear} />
      ) : undefined;

    return (
      <>
        <van-field
          ref="el"
          readonly
          isLink={!this.disabled}
          disabled={this.disabled}
          placeholder={this.placeholder}
          modelValue={this.displayValue}
          onClick={this.open}
          v-slots={{ "right-icon": clearIcon }}
        />
        <van-popup
          show={this.show}
          onUpdate:show={(value) => (this.show = value)}
          round
          position="bottom"
          class="fc-select-popup"
        >
          {this.filterable ? (
            <van-search
              modelValue={this.keyword}
              onUpdate:modelValue={(value) => (this.keyword = value)}
              placeholder={this.placeholder}
            />
          ) : null}
          <div class="fc-select-options">
            {this.multiple ? (
              <van-checkbox-group
                modelValue={this.selectedValues}
                onUpdate:modelValue={this.toggleMultiple}
              >
                {this.filteredOptions.map((option, index) => (
                  <van-cell
                    key={`${this.optionValue(option)}-${index}`}
                    title={String(this.optionLabel(option))}
                    clickable
                    onClick={() => {
                      const value = this.optionValue(option);
                      const next = this.selectedValues.includes(value)
                        ? this.selectedValues.filter((item) => item !== value)
                        : [...this.selectedValues, value];
                      this.toggleMultiple(next);
                    }}
                    v-slots={{
                      rightIcon: () => (
                        <van-checkbox
                          name={this.optionValue(option)}
                          onClick={(event) => event.stopPropagation()}
                        />
                      ),
                    }}
                  />
                ))}
              </van-checkbox-group>
            ) : (
              this.filteredOptions.map((option, index) => (
                <van-cell
                  key={`${this.optionValue(option)}-${index}`}
                  title={String(this.optionLabel(option))}
                  clickable
                  onClick={() => this.selectOne(option)}
                  v-slots={{
                    rightIcon: () =>
                      this.selectedValues[0] === this.optionValue(option) ? (
                        <van-icon name="success" color="var(--van-primary-color)" />
                      ) : null,
                  }}
                />
              ))
            )}
            {!this.filteredOptions.length ? <van-empty /> : null}
          </div>
          {this.multiple ? (
            <div class="fc-select-popup-footer">
              <van-button block type="primary" onClick={() => (this.show = false)}>
                确定
              </van-button>
            </div>
          ) : null}
        </van-popup>
      </>
    );
  },
  mounted() {
    this.$emit("fc.el", this.$refs.el);
  },
});
