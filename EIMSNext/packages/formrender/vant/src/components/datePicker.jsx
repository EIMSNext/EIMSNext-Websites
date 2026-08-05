import { computed, defineComponent, ref, watch } from "vue";
import dayjs from "dayjs";

const parseValue = (value) => {
  if (value === undefined || value === null || value === "") return dayjs();
  if (typeof value === "number" || /^\d{10,13}$/.test(String(value))) {
    const numeric = Number(value);
    return dayjs(String(value).length === 10 ? numeric * 1000 : numeric);
  }
  return dayjs(value);
};

const pad = (value) => String(value).padStart(2, "0");

export default defineComponent({
  name: "fcDatePicker",
  inheritAttrs: false,
  props: {
    disabled: Boolean,
    readonly: Boolean,
    clearable: Boolean,
    placeholder: String,
    modelValue: [String, Number, Date],
    minDate: [String, Number, Date],
    maxDate: [String, Number, Date],
    type: {
      type: String,
      default: "date",
    },
    format: String,
    valueFormat: String,
  },
  emits: ["update:modelValue", "fc.el", "change", "clear"],
  setup(props, { emit }) {
    const show = ref(false);
    const dateValue = ref([]);
    const timeValue = ref([]);
    const isDateTime = computed(() => props.type === "datetime");
    const columnsType = computed(() => {
      if (props.type === "year") return ["year"];
      if (props.type === "month") return ["year", "month"];
      return ["year", "month", "day"];
    });
    const displayFormat = computed(
      () =>
        props.format ||
        (props.type === "datetime"
          ? "YYYY-MM-DD HH:mm:ss"
          : props.type === "month"
            ? "YYYY-MM"
            : props.type === "year"
              ? "YYYY"
              : "YYYY-MM-DD"),
    );
    const displayValue = computed(() =>
      props.modelValue === undefined || props.modelValue === null || props.modelValue === ""
        ? ""
        : parseValue(props.modelValue).format(displayFormat.value),
    );
    const dateRange = computed(() => {
      const range = {};
      if (props.minDate) range.minDate = parseValue(props.minDate).toDate();
      if (props.maxDate) range.maxDate = parseValue(props.maxDate).toDate();
      return range;
    });

    const syncPicker = () => {
      const current = parseValue(props.modelValue);
      dateValue.value = [
        String(current.year()),
        pad(current.month() + 1),
        pad(current.date()),
      ].slice(0, columnsType.value.length);
      timeValue.value = [pad(current.hour()), pad(current.minute()), pad(current.second())];
    };

    watch(
      () => [props.modelValue, props.type],
      syncPicker,
      { immediate: true },
    );

    const serialize = (value) => {
      if (props.valueFormat === "x") return String(value.valueOf());
      if (props.valueFormat === "X") return String(Math.floor(value.valueOf() / 1000));
      return value.format(props.valueFormat || displayFormat.value);
    };

    const confirm = (event) => {
      const current = parseValue(props.modelValue);
      const values = Array.isArray(event?.selectedValues) ? event.selectedValues : dateValue.value;
      if (values.length !== columnsType.value.length) return;
      const [year, month = "01", date = "01"] = values;
      const [hour = "00", minute = "00", second = "00"] = timeValue.value;
      const next = dayjs(current)
        .year(Number(year))
        .month(Number(month) - 1)
        .date(Number(date))
        .hour(isDateTime.value ? Number(hour) : 0)
        .minute(isDateTime.value ? Number(minute) : 0)
        .second(isDateTime.value ? Number(second) : 0)
        .millisecond(0);
      const value = serialize(next);
      show.value = false;
      emit("update:modelValue", value);
      emit("change", value);
    };

    const clear = (event) => {
      event?.stopPropagation?.();
      emit("update:modelValue", "");
      emit("change", "");
      emit("clear");
    };

    return {
      show,
      dateValue,
      timeValue,
      isDateTime,
      columnsType,
      displayValue,
      dateRange,
      open() {
        if (props.disabled || props.readonly) return;
        syncPicker();
        show.value = true;
      },
      confirm,
      clear,
    };
  },
  render() {
    const clearIcon = () =>
      this.clearable && this.displayValue && !this.disabled && !this.readonly ? (
        <van-icon name="clear" onClick={this.clear} />
      ) : undefined;
    return (
      <>
        <van-field
          ref="el"
          readonly
          disabled={this.disabled}
          placeholder={this.placeholder}
          modelValue={this.displayValue}
          isLink={!this.disabled && !this.readonly}
          onClick={this.open}
          v-slots={{ "right-icon": clearIcon }}
        />
        <van-popup
          show={this.show}
          onUpdate:show={(value) => (this.show = value)}
          round
          position="bottom"
        >
          <van-date-picker
            {...this.$attrs}
            {...this.dateRange}
            columnsType={this.columnsType}
            modelValue={this.dateValue}
            onUpdate:modelValue={(value) => {
              if (Array.isArray(value) && value.length === this.columnsType.length) {
                this.dateValue = value;
              }
            }}
            onConfirm={(event) => {
              this.confirm(event);
              this.show = false;
            }}
            onCancel={() => (this.show = false)}
            v-slots={
              this.isDateTime
                ? {
                    "columns-top": () => (
                      <van-time-picker
                        columnsType={["hour", "minute", "second"]}
                        showToolbar={false}
                        modelValue={this.timeValue}
                        onUpdate:modelValue={(value) => (this.timeValue = value)}
                      />
                    ),
                  }
                : undefined
            }
          />
        </van-popup>
      </>
    );
  },
  mounted() {
    this.$emit("fc.el", this.$refs.el);
  },
});
