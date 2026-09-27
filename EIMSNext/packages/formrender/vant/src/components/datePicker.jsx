import { computed, defineComponent, ref, watch } from "vue";
import dayjs from "dayjs";

const FALLBACK_MIN_DATE = new Date(1900, 0, 1);
const FALLBACK_MAX_DATE = new Date(2100, 11, 31);

const parseValue = (value) => {
  if (value === undefined || value === null || value === "") return dayjs();
  if (value instanceof Date) return dayjs(value);
  if (typeof value === "number" || /^\d{10,13}$/.test(String(value))) {
    const numeric = Number(value);
    return dayjs(String(value).length === 10 ? numeric * 1000 : numeric);
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : dayjs();
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
    modelValue: [String, Number, Date, Array],
    minDate: [String, Number, Date],
    maxDate: [String, Number, Date],
    type: {
      type: String,
      default: "date",
    },
    columnsType: Array,
    format: String,
    valueFormat: String,
    formCreateInject: Object,
  },
  emits: ["update:modelValue", "fc.el", "change", "clear"],
  setup(props, { emit }) {
    const show = ref(false);
    const panel = ref("date");
    const draft = ref(parseValue(props.modelValue));
    const rangeDraft = ref([]);
    const pickerValue = ref([]);

    const isRange = computed(() =>
      ["daterange", "datetimerange", "monthrange"].includes(props.type),
    );

    const displayFormat = computed(
      () =>
        props.format ||
        (props.type === "datetime" || props.type === "datetimerange"
          ? "YYYY-MM-DD HH:mm:ss"
          : props.type === "month" || props.type === "monthrange"
            ? "YYYY-MM"
            : props.type === "year"
              ? "YYYY"
              : "YYYY-MM-DD"),
    );
    const isDateTime = computed(
      () =>
        props.type === "datetime" ||
        props.type === "datetimerange" ||
        displayFormat.value.includes("H"),
    );
    const isMonthPicker = computed(() => {
      if (isRange.value) return false;
      if (Array.isArray(props.columnsType) && props.columnsType.length) {
        return !props.columnsType.includes("day") && !isDateTime.value;
      }
      return props.type === "year" || props.type === "month" || !displayFormat.value.includes("DD");
    });
    const hasSeconds = computed(() => displayFormat.value.includes("ss"));
    const columnsType = computed(() => {
      if (Array.isArray(props.columnsType) && props.columnsType.length) {
        return props.columnsType;
      }
      return props.type === "year" || displayFormat.value === "YYYY"
        ? ["year"]
        : ["year", "month"];
    });
    const timeValue = computed(() => {
      const index = panel.value === "time-end" ? 1 : 0;
      const current = isRange.value
        ? rangeDraft.value[index] || rangeDraft.value[0] || dayjs()
        : draft.value;
      const values = [pad(current.hour()), pad(current.minute())];
      if (hasSeconds.value) values.push(pad(current.second()));
      return values;
    });
    const timeColumns = computed(() =>
      hasSeconds.value ? ["hour", "minute", "second"] : ["hour", "minute"],
    );
    const displayValue = computed(() => {
      if (isRange.value) {
        return (Array.isArray(props.modelValue) ? props.modelValue : [])
          .filter((value) => value !== undefined && value !== null && value !== "")
          .map((value) => parseValue(value).format(displayFormat.value))
          .join(" - ");
      }
      return props.modelValue === undefined || props.modelValue === null || props.modelValue === ""
        ? ""
        : parseValue(props.modelValue).format(displayFormat.value);
    });
    const calendarRange = computed(() => ({
      minDate: props.minDate ? parseValue(props.minDate).toDate() : FALLBACK_MIN_DATE,
      maxDate: props.maxDate ? parseValue(props.maxDate).toDate() : FALLBACK_MAX_DATE,
    }));

    const t = (key, fallback) => {
      const translate = props.formCreateInject?.t;
      if (!translate) return fallback;
      const localeKey = `comp.mobileDatePicker.${key}`;
      const value = translate(localeKey);
      return value && value !== localeKey ? value : fallback;
    };

    const syncDraft = () => {
      const values = Array.isArray(props.modelValue) ? props.modelValue : [];
      rangeDraft.value = isRange.value ? values.filter(Boolean).map(parseValue) : [];
      draft.value = isRange.value
        ? rangeDraft.value[0] || dayjs()
        : parseValue(props.modelValue);
      pickerValue.value = [String(draft.value.year()), pad(draft.value.month() + 1)].slice(
        0,
        columnsType.value.length,
      );
      panel.value = "date";
    };

    watch(
      () => [props.modelValue, props.type, props.format, props.valueFormat],
      () => {
        if (!show.value) syncDraft();
      },
      { immediate: true },
    );

    const serialize = (value) => {
      if (props.valueFormat === "x") return String(value.valueOf());
      if (props.valueFormat === "X") return String(Math.floor(value.valueOf() / 1000));
      return value.format(props.valueFormat || displayFormat.value);
    };

    const emitValue = (value) => {
      emit("update:modelValue", value);
      emit("change", value);
    };

    const confirm = () => {
      if (isRange.value) {
        if (rangeDraft.value.length < 2) return;
        emitValue(rangeDraft.value.map((value) => serialize(value.millisecond(0))));
        show.value = false;
        return;
      }
      if (isMonthPicker.value) {
        const [year, month = "01"] = pickerValue.value;
        draft.value = draft.value.year(Number(year)).month(Number(month) - 1).date(1);
      }
      emitValue(serialize(draft.value.millisecond(0)));
      show.value = false;
    };

    const clear = (event) => {
      event?.stopPropagation?.();
      emitValue(isRange.value ? [] : "");
      emit("clear");
      show.value = false;
    };

    const selectToday = () => {
      const now = dayjs();
      if (isRange.value) {
        rangeDraft.value = isDateTime.value
          ? [now.millisecond(0), now.millisecond(0)]
          : [now.startOf("day"), now.endOf("day")];
        draft.value = rangeDraft.value[0];
        panel.value = "date";
        return;
      }
      draft.value = isDateTime.value
        ? now.millisecond(0)
        : now.startOf("day");
      pickerValue.value = [String(now.year()), pad(now.month() + 1)].slice(
        0,
        columnsType.value.length,
      );
      panel.value = "date";
    };

    return {
      show,
      panel,
      draft,
      rangeDraft,
      pickerValue,
      displayFormat,
      isRange,
      isDateTime,
      isMonthPicker,
      timeValue,
      timeColumns,
      columnsType,
      displayValue,
      calendarRange,
      t,
      open() {
        if (props.disabled || props.readonly) return;
        syncDraft();
        show.value = true;
      },
      close() {
        syncDraft();
        show.value = false;
      },
      selectDate(value) {
        if (isRange.value) {
          const values = Array.isArray(value) ? value : [value];
          rangeDraft.value = values.filter(Boolean).map((item, index) => {
            const selected = dayjs(item);
            const previous = rangeDraft.value[index];
            if (!previous) {
              return isDateTime.value
                ? selected.startOf("day")
                : index === 0
                  ? selected.startOf("day")
                  : selected.endOf("day");
            }
            return selected
              .hour(previous.hour())
              .minute(previous.minute())
              .second(previous.second())
              .millisecond(0);
          });
          draft.value = rangeDraft.value[0] || dayjs();
          return;
        }
        const selected = dayjs(value);
        draft.value = draft.value
          .year(selected.year())
          .month(selected.month())
          .date(selected.date());
      },
      updateTime(values) {
        const [hour = "00", minute = "00", second = "00"] = values;
        if (isRange.value) {
          const index = panel.value === "time-end" ? 1 : 0;
          const current = rangeDraft.value[index] || rangeDraft.value[0] || dayjs();
          rangeDraft.value[index] = current
            .hour(Number(hour))
            .minute(Number(minute))
            .second(Number(second));
          return;
        }
        draft.value = draft.value
          .hour(Number(hour))
          .minute(Number(minute))
          .second(Number(second));
      },
      confirm,
      clear,
      selectToday,
    };
  },
  render() {
    const rightIcon = () => {
      if (this.clearable && this.displayValue && !this.disabled && !this.readonly) {
        return <van-icon name="clear" onClick={this.clear} />;
      }
      return <van-icon name="calendar-o" />;
    };

    const toolbar = () => (
      <div class="fc-date-sheet-toolbar">
        <button type="button" onClick={this.clear}>
          {this.t("clear", "清空")}
        </button>
        <button type="button" onClick={this.selectToday}>
          {this.isDateTime ? this.t("now", "此刻") : this.t("today", "今天")}
        </button>
        <span />
        <button type="button" onClick={this.confirm}>
          {this.t("confirm", "确定")}
        </button>
      </div>
    );

    const dateTimeTabs = () =>
      this.isDateTime ? (
        <div class="fc-date-sheet-tabs">
          {(this.isRange ? this.rangeDraft : [this.draft]).map((value, index) => (
            <div class="fc-date-sheet-tab-group" key={index}>
              <button
                type="button"
                class={this.panel === "date" ? "is-active" : ""}
                onClick={() => (this.panel = "date")}
              >
                {value?.format("YYYY年 M月 D日")}
              </button>
              {this.isRange ? (
                <button
                  type="button"
                  class={this.panel === `time-${index === 1 ? "end" : "start"}` ? "is-active" : ""}
                  onClick={() => (this.panel = `time-${index === 1 ? "end" : "start"}`)}
                >
                  {value?.format(this.timeColumns.length === 3 ? "HH:mm:ss" : "HH:mm")}
                </button>
              ) : null}
            </div>
          ))}
          {!this.isRange ? (
            <button
              type="button"
              class={this.panel === "time" ? "is-active" : ""}
              onClick={() => (this.panel = "time")}
            >
              {this.draft.format(this.timeColumns.length === 3 ? "HH:mm:ss" : "HH:mm")}
            </button>
          ) : null}
        </div>
      ) : null;

    const picker = () => {
      if (this.isMonthPicker) {
        return (
          <van-date-picker
            {...this.$attrs}
            showToolbar={false}
            columnsType={this.columnsType}
            minDate={this.calendarRange.minDate}
            maxDate={this.calendarRange.maxDate}
            modelValue={this.pickerValue}
            onUpdate:modelValue={(value) => {
              if (Array.isArray(value) && value.length === this.columnsType.length) {
                this.pickerValue = value;
              }
            }}
          />
        );
      }
      if (this.panel === "time" || this.panel === "time-start" || this.panel === "time-end") {
        return (
          <van-time-picker
            {...this.$attrs}
            showToolbar={false}
            columnsType={this.timeColumns}
            modelValue={this.timeValue}
            onUpdate:modelValue={this.updateTime}
          />
        );
      }
      return (
        <van-calendar
          {...this.calendarRange}
          poppable={false}
          showTitle={false}
          showSubtitle
          showConfirm={false}
          switchMode="month"
          type={this.isRange ? "range" : "single"}
          allowSameDay
          defaultDate={this.isRange
            ? (this.rangeDraft.length ? this.rangeDraft.map((value) => value.toDate()) : undefined)
            : this.draft.toDate()}
          onSelect={this.selectDate}
        />
      );
    };

    return (
      <>
        <van-field
          ref="el"
          readonly
          disabled={this.disabled}
          placeholder={this.placeholder}
          modelValue={this.displayValue}
          isLink={false}
          onClick={this.open}
          v-slots={{ "right-icon": rightIcon }}
        />
        <van-popup
          show={this.show}
          onUpdate:show={(value) => {
            if (!value) this.close();
          }}
          round
          position="bottom"
          teleport={this.formCreateInject?.popupContainer ?? undefined}
          closeOnPopstate
          class="fc-date-sheet"
        >
          {toolbar()}
          {dateTimeTabs()}
          <div class="fc-date-sheet-content">{picker()}</div>
        </van-popup>
      </>
    );
  },
  mounted() {
    this.$emit("fc.el", this.$refs.el);
  },
});
