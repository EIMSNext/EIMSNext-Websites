<template>
  <section class="_fd-static-options">
    <header class="_fd-static-options__header">
      <span>{{ t("props.options") }}</span>
      <div class="_fd-static-options__color-toggle">
        <span>{{ t("props.color") }}</span>
        <el-switch
          :model-value="colorEnabled"
          size="small"
          @update:model-value="setColorEnabled"
        />
      </div>
    </header>

    <draggable
      v-model="options"
      item-key="value"
      handle="._fd-static-options__drag"
      :animation="150"
      @change="onOptionsChanged"
    >
      <template #item="{ element: option, index }">
        <div class="_fd-static-options__row">
          <button
            type="button"
            class="_fd-static-options__default"
            :class="{ 'is-checked': isDefault(option) }"
            :aria-checked="isDefault(option)"
            :role="multiple ? 'checkbox' : 'radio'"
            :title="t('props.inputData')"
            @click="toggleDefault(option)"
          >
            <span></span>
          </button>
          <el-input
            :model-value="option.label"
            size="small"
            :aria-label="t('props.label')"
            @update:model-value="updateOption(option, 'label', $event)"
          />
          <el-input
            :model-value="option.value"
            size="small"
            :aria-label="t('props.value')"
            @update:model-value="updateValue(option, $event)"
          />
          <template v-if="colorEnabled">
            <el-color-picker
              :model-value="option.color || undefined"
              color-format="hex"
              :predefine="predefineColors"
              size="small"
              :aria-label="t('props.color')"
              @update:model-value="updateColor(option, $event)"
            />
            <el-tooltip :content="t('props.clear')">
              <button
                type="button"
                class="_fd-static-options__icon-button"
                :disabled="!option.color"
                @click="clearColor(option)"
              >
                <i class="fc-icon icon-refresh"></i>
              </button>
            </el-tooltip>
          </template>
          <i class="fc-icon icon-move _fd-static-options__drag" :title="t('tableOptions.handle')"></i>
          <el-tooltip :content="t('props.delete')">
            <button
              type="button"
              class="_fd-static-options__icon-button is-danger"
              @click="remove(index)"
            >
              <i class="fc-icon icon-delete"></i>
            </button>
          </el-tooltip>
        </div>
      </template>
    </draggable>

    <el-button link type="primary" @click="add">
      <i class="fc-icon icon-add"></i> {{ t("tableOptions.add") }}
    </el-button>
  </section>
</template>

<script>
import { defineComponent } from "vue";
import draggable from "vuedraggable/src/vuedraggable";

const PREDEFINE_COLORS = [
  "#ef5350",
  "#ff9800",
  "#fbc02d",
  "#8bc34a",
  "#42bd73",
  "#00acc1",
  "#4f7cff",
  "#8e66d9",
  "#d65bb4",
  "#ec407a",
  "#607d8b",
];

const optionValue = (value) =>
  value && typeof value === "object" ? value.value : value;

export default defineComponent({
  name: "StaticOptionsConfig",
  components: { draggable },
  emits: ["update:modelValue", "change"],
  props: {
    modelValue: Array,
    multiple: Boolean,
    colorField: {
      type: String,
      default: "optionColor",
    },
  },
  inject: ["designer"],
  data() {
    return {
      options: this.normalizeOptions(this.modelValue),
      predefineColors: PREDEFINE_COLORS,
    };
  },
  computed: {
    t() {
      return this.designer.setupState.t;
    },
    activeRule() {
      return this.designer.setupState.activeRule;
    },
    colorEnabled() {
      return !!this.activeRule?.props?.[this.colorField];
    },
  },
  watch: {
    modelValue(value) {
      if (value !== this.options) {
        this.options = this.normalizeOptions(value);
      }
    },
  },
  methods: {
    normalizeOptions(value) {
      return (Array.isArray(value) ? value : []).map((option) => {
        if (option && typeof option === "object") {
          return {
            ...option,
            label: option.label ?? option.value ?? "",
            value: option.value ?? option.label ?? "",
          };
        }
        return { label: option ?? "", value: option ?? "" };
      });
    },
    currentValues() {
      const value = this.activeRule?.value;
      if (this.multiple) {
        return (Array.isArray(value) ? value : []).map(optionValue);
      }
      return value === undefined || value === null || value === ""
        ? []
        : [optionValue(value)];
    },
    setDefaultValues(values) {
      if (!this.activeRule) return;
      this.activeRule.value = this.multiple ? values : values[0];
    },
    isDefault(option) {
      return this.currentValues().some((value) => value === option.value);
    },
    toggleDefault(option) {
      const values = this.currentValues();
      if (this.multiple) {
        const next = values.includes(option.value)
          ? values.filter((value) => value !== option.value)
          : [...values, option.value];
        this.setDefaultValues(next);
      } else {
        this.setDefaultValues(values[0] === option.value ? [] : [option.value]);
      }
      this.$emit("change", this.options);
    },
    updateOption(option, field, value) {
      option[field] = value;
      this.onOptionsChanged();
    },
    updateValue(option, value) {
      const previous = option.value;
      option.value = value;
      const selected = this.currentValues().map((item) =>
        item === previous ? value : item,
      );
      const available = new Set(this.options.map((item) => item.value));
      const unique = [...new Set(selected)].filter((item) => available.has(item));
      this.setDefaultValues(this.multiple ? unique : unique.slice(0, 1));
      this.onOptionsChanged();
    },
    updateColor(option, color) {
      if (color) option.color = color;
      else delete option.color;
      this.onOptionsChanged();
    },
    clearColor(option) {
      delete option.color;
      this.onOptionsChanged();
    },
    setColorEnabled(value) {
      if (!this.activeRule) return;
      if (!this.activeRule.props) this.activeRule.props = {};
      this.activeRule.props[this.colorField] = value;
    },
    remove(index) {
      this.options.splice(index, 1);
      this.syncDefaultValues();
      this.onOptionsChanged();
    },
    add() {
      const index = this.options.length + 1;
      const label = `${this.t("props.option")}${index}`;
      this.options.push({ label, value: label });
      this.onOptionsChanged();
    },
    syncDefaultValues() {
      const available = new Set(this.options.map((item) => item.value));
      const values = this.currentValues().filter((value) => available.has(value));
      this.setDefaultValues(this.multiple ? values : values.slice(0, 1));
    },
    onOptionsChanged() {
      this.syncDefaultValues();
      this.$emit("update:modelValue", this.options);
      this.$emit("change", this.options);
    },
  },
});
</script>

<style>
._fd-static-options {
  width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
}

._fd-static-options__header,
._fd-static-options__color-toggle,
._fd-static-options__row {
  display: flex;
  align-items: center;
}

._fd-static-options__header {
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--fc-text-color-1);
  font-size: 14px;
  font-weight: 600;
}

._fd-static-options__color-toggle {
  gap: 6px;
  color: var(--fc-text-color-2);
  font-size: 13px;
  font-weight: 400;
}

._fd-static-options__row {
  gap: 6px;
  min-height: 32px;
  margin-bottom: 6px;
}

._fd-static-options__row .el-input {
  flex: 1 1 0;
  min-width: 0;
}

._fd-static-options__default,
._fd-static-options__icon-button {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--fc-text-color-3);
  cursor: pointer;
}

._fd-static-options__default > span {
  width: 14px;
  height: 14px;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color);
  border-radius: 50%;
  background: var(--el-bg-color);
}

._fd-static-options__default[role="checkbox"] > span {
  border-radius: 3px;
}

._fd-static-options__default.is-checked > span {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary);
  box-shadow: inset 0 0 0 3px var(--el-bg-color);
}

._fd-static-options__default[role="checkbox"].is-checked > span {
  box-shadow: inset 0 0 0 3px var(--el-bg-color);
}

._fd-static-options__row .el-color-picker {
  flex: 0 0 auto;
}

._fd-static-options__row .el-color-picker__trigger {
  width: 22px;
  height: 22px;
  padding: 2px;
  border: 0;
  border-radius: 50%;
}

._fd-static-options__row .el-color-picker__color {
  border: 0;
  border-radius: 50%;
}

._fd-static-options__drag {
  flex: 0 0 auto;
  padding: 3px;
  color: var(--fc-text-color-3);
  cursor: move;
}

._fd-static-options__icon-button:hover:not(:disabled) {
  color: var(--el-color-primary);
}

._fd-static-options__icon-button.is-danger:hover:not(:disabled) {
  color: var(--el-color-danger);
}

._fd-static-options__icon-button:disabled {
  cursor: default;
  opacity: 0.35;
}
</style>
