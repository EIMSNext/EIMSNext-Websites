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
            <el-popover
              :visible="colorPopoverOption === option"
              trigger="click"
              placement="bottom-start"
              :width="252"
              :teleported="false"
              @update:visible="setColorPopoverVisible(option, $event)"
            >
              <template #reference>
                <button
                  type="button"
                  class="_fd-static-options__color-button"
                  :aria-label="t('props.color')"
                  @click.stop
                >
                  <span
                    class="_fd-static-options__color-swatch"
                    :style="option.color ? { backgroundColor: option.color } : undefined"
                  ></span>
                </button>
              </template>
              <div class="_fd-color-board" @click.stop>
                <div class="_fd-color-board__section">
                  <div class="_fd-color-board__label">{{ t('props.recommendedColor') }}</div>
                  <div class="_fd-color-board__colors">
                    <button
                      v-for="color in predefineColors"
                      :key="color"
                      type="button"
                      class="_fd-color-board__color-box"
                      :class="{ 'is-selected': option.color === color }"
                      :aria-label="color"
                      @click="selectColor(option, color)"
                    >
                      <span class="_fd-color-board__color" :style="{ backgroundColor: color }"></span>
                    </button>
                  </div>
                </div>
                <div class="_fd-color-board__section _fd-color-board__custom">
                  <div class="_fd-color-board__label">{{ t('props.customColor') }}</div>
                  <div class="_fd-color-board__colors">
                    <el-popover
                      :visible="customColorOption === option && customColorOpen"
                      trigger="click"
                      placement="top-end"
                      :width="284"
                      :teleported="false"
                      @update:visible="setCustomPickerVisible(option, $event)"
                    >
                      <template #reference>
                        <button
                          type="button"
                          class="_fd-color-board__add"
                          :aria-label="t('props.addColor')"
                          @click.stop
                        >
                          <i class="fc-icon icon-add"></i>
                        </button>
                      </template>
                      <div class="_fd-custom-color-picker" @click.stop>
                        <div class="_fd-custom-color-picker__title">{{ t('props.customColor') }}</div>
                        <el-color-picker-panel
                          :model-value="customColorValue"
                          :border="false"
                          color-format="hex"
                          @update:model-value="updateCustomColor"
                        />
                      </div>
                    </el-popover>
                    <button
                      v-for="color in customColors"
                      :key="color"
                      type="button"
                      class="_fd-color-board__color-box"
                      :class="{ 'is-selected': option.color === color }"
                      :aria-label="color"
                      @click="selectColor(option, color)"
                    >
                      <span class="_fd-color-board__color" :style="{ backgroundColor: color }"></span>
                    </button>
                  </div>
                </div>
              </div>
            </el-popover>
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
import { ElColorPickerPanel } from "element-plus";
import draggable from "vuedraggable/src/vuedraggable";

const PREDEFINE_COLORS = [
  "#eb5050", "#f0a800", "#46c26f", "#a2c204", "#00aed1", "#5865f5", "#c643e0", "#f0437d",
  "#fa8118", "#d6c504", "#00b899", "#6ac73c", "#2f7deb", "#7e47eb", "#d941c0", "#485970",
  "#f9cbcb", "#fbe5b3", "#c8edd4", "#e3edb4", "#b3e7f1", "#cdd1fc", "#eec7f6", "#fbc7d8",
  "#fed9ba", "#f3eeb4", "#b3eadf", "#d2eec5", "#c1d8f9", "#d8c8f9", "#f4c6ec", "#c8cdd4",
];
const CUSTOM_COLOR_STORAGE_KEY = "eimsnext.formdesigner.custom-colors";

const optionValue = (value) =>
  value && typeof value === "object" ? value.value : value;

const collectCustomColors = (options) => [...new Set(
  (Array.isArray(options) ? options : [])
    .map((option) => option?.color)
    .filter((color) => color && !PREDEFINE_COLORS.some((item) => item.toLowerCase() === color.toLowerCase())),
)];

const readStoredCustomColors = () => {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(CUSTOM_COLOR_STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter((color) => typeof color === "string" && color) : [];
  } catch {
    return [];
  }
};

export default defineComponent({
  name: "StaticOptionsConfig",
  components: { draggable, ElColorPickerPanel },
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
      customColors: [...new Set([...readStoredCustomColors(), ...collectCustomColors(this.modelValue)])],
      colorPopoverOption: null,
      customColorOption: null,
      customColorOpen: false,
      customColorValue: PREDEFINE_COLORS[0],
      customColorInitial: PREDEFINE_COLORS[0],
      customColorDirty: false,
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
      collectCustomColors(value).forEach((color) => this.addCustomColor(color));
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
    setColorEnabled(value) {
      if (!this.activeRule) return;
      if (!this.activeRule.props) this.activeRule.props = {};
      this.activeRule.props[this.colorField] = value;
      if (value) {
        this.options.forEach((option, index) => {
          if (!option.color) {
            option.color = this.predefineColors[index % this.predefineColors.length];
          }
        });
        this.onOptionsChanged();
      } else {
        this.$emit("change", this.options);
      }
    },
    setColorPopoverVisible(option, visible) {
      if (visible) {
        this.colorPopoverOption = option;
        return;
      }
      if (this.colorPopoverOption === option) {
        this.colorPopoverOption = null;
        this.closeCustomPicker(false);
      }
    },
    selectColor(option, color) {
      this.updateColor(option, color);
      this.colorPopoverOption = null;
      this.closeCustomPicker(false);
    },
    setCustomPickerVisible(option, visible) {
      if (visible) {
        this.openCustomPicker(option);
      } else {
        this.closeCustomPicker(false);
      }
    },
    openCustomPicker(option) {
      this.customColorOption = option;
      this.customColorValue = option.color || this.predefineColors[0];
      this.customColorInitial = this.customColorValue;
      this.customColorDirty = false;
      this.customColorOpen = true;
    },
    closeCustomPicker(visible) {
      if (visible) return;
      if (this.customColorOpen && this.customColorDirty && this.customColorValue) {
        this.addCustomColor(this.customColorValue);
        if (this.customColorOption) this.updateColor(this.customColorOption, this.customColorValue);
        this.persistCustomColors();
      }
      this.customColorOpen = false;
      this.customColorOption = null;
      this.customColorDirty = false;
    },
    updateCustomColor(color) {
      if (!color) return;
      this.customColorValue = color;
      this.customColorDirty = color.toLowerCase() !== this.customColorInitial.toLowerCase();
    },
    addCustomColor(color) {
      if (color && !this.customColors.some((item) => item.toLowerCase() === color.toLowerCase())) {
        this.customColors.push(color);
      }
    },
    persistCustomColors() {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(CUSTOM_COLOR_STORAGE_KEY, JSON.stringify(this.customColors));
      } catch {
        // Storage can be unavailable in private browsing or restricted previews.
      }
    },
    remove(index) {
      this.options.splice(index, 1);
      this.syncDefaultValues();
      this.onOptionsChanged();
    },
    add() {
      const index = this.options.length + 1;
      const label = `${this.t("props.option")}${index}`;
      const option = { label, value: label };
      if (this.colorEnabled) {
        option.color = this.predefineColors[this.options.length % this.predefineColors.length];
      }
      this.options.push(option);
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

._fd-static-options__color-button {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--el-bg-color);
  cursor: pointer;
}

._fd-static-options__color-swatch {
  width: 18px;
  height: 18px;
  border: 1px solid var(--el-border-color);
  border-radius: 50%;
  background: var(--el-fill-color-light);
}

._fd-color-board {
  width: 100%;
  color: var(--fc-text-color-1);
  font-size: 12px;
}

._fd-color-board__section + ._fd-color-board__section {
  margin-top: 14px;
}

._fd-color-board__label {
  margin-bottom: 8px;
}

._fd-color-board__colors {
  display: grid;
  grid-template-columns: repeat(8, 20px);
  gap: 7px;
  align-items: center;
}

._fd-color-board__color-box,
._fd-color-board__add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

._fd-color-board__color-box.is-selected {
  border-color: var(--el-color-primary);
}

._fd-color-board__color {
  width: 18px;
  height: 18px;
  border-radius: 50%;
}

._fd-color-board__add {
  border-color: var(--el-border-color);
  color: var(--el-text-color-secondary);
}

._fd-color-board__add:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

._fd-custom-color-picker {
  width: 260px;
  padding: 0;
}

._fd-custom-color-picker__title {
  margin-bottom: 10px;
  color: var(--fc-text-color-1);
  font-size: 13px;
  line-height: 20px;
}

._fd-custom-color-picker .el-color-picker-panel {
  width: 236px;
  padding: 0;
  box-sizing: border-box;
  border: 0;
  box-shadow: none;
}

._fd-custom-color-picker .el-color-picker-panel__wrapper,
._fd-custom-color-picker .el-color-svpanel,
._fd-custom-color-picker .el-color-hue-slider {
  width: 236px;
}

._fd-custom-color-picker .el-color-picker-panel__footer .el-input {
  width: 100%;
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
