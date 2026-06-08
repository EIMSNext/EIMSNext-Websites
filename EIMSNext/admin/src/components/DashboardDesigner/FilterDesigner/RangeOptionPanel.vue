<template>
  <div class="range-option-panel">
    <div class="range-header">
      <div class="range-header-left">
        <span class="range-source-icon">
          <template v-if="rangeSourceType == 'staticOptions'">📋</template>
          <template v-else-if="rangeSourceType == 'distinctData'">🗃️</template>
          <template v-else-if="rangeSourceType == 'memberScope'">👥</template>
          <template v-else-if="rangeSourceType == 'fixedRange'">🔢</template>
        </span>
        <span class="range-source-label">{{ rangeTypeLabel }}</span>
      </div>
      <el-switch
        :model-value="localEnabled"
        size="small"
        @change="(val: any) => toggleEnabled(Boolean(val))"
      />
    </div>

    <div v-if="isSelectType" class="range-body">
      <template v-if="localEnabled && hasItems">
        <div class="range-select-wrap">
          <el-select
            :model-value="selectedIds"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            :placeholder="t('admin.dashboardFilterDesigner.rangePanel.searchAndSelect')"
            class="range-select"
            @change="onItemsChange"
          >
            <el-option
              v-for="item in currentOptions"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
          <el-button v-if="selectedIds.length > 0" size="small" text @click="clearItems">{{ t("admin.dashboardFilterDesigner.rangePanel.clear") }}</el-button>
        </div>

        <div v-if="selectedIds.length > 0" class="selected-tags">
          <el-tag
            v-for="id in selectedIds"
            :key="id"
            closable
            size="small"
            @close="removeItem(id)"
          >
            {{ getItemLabel(id) }}
          </el-tag>
        </div>
        <div v-else class="range-empty">{{ t("admin.dashboardFilterDesigner.rangePanel.emptySelected") }}</div>
      </template>

      <div v-if="!localEnabled" class="range-hint-text">
        <template v-if="rangeSourceType == 'staticOptions'">
          {{ t("admin.dashboardFilterDesigner.rangePanel.staticOptionsHint") }}
        </template>
        <template v-else>
          {{ t("admin.dashboardFilterDesigner.rangePanel.distinctDataHint") }}
        </template>
      </div>

      <div v-if="localEnabled && isSelectType && !hasItems" class="range-empty">
        {{ t("admin.dashboardFilterDesigner.rangePanel.noCandidates") }}
      </div>
    </div>

    <div v-if="isFixedRangeType" class="range-body">
      <div v-if="localEnabled" class="fixed-range-editor">
        <div class="range-input-row">
          <span class="range-input-label">{{ t("admin.dashboardFilterDesigner.rangePanel.min") }}</span>
          <el-input
            :model-value="minValue"
            type="number"
            :placeholder="t('admin.dashboardFilterDesigner.rangePanel.noLimit')"
            size="small"
            @input="onMinInput"
          />
        </div>
        <div class="range-input-row">
          <span class="range-input-label">{{ t("admin.dashboardFilterDesigner.rangePanel.max") }}</span>
          <el-input
            :model-value="maxValue"
            type="number"
            :placeholder="t('admin.dashboardFilterDesigner.rangePanel.noLimit')"
            size="small"
            @input="onMaxInput"
          />
        </div>
      </div>
      <div v-else class="range-hint-text">
        {{ t("admin.dashboardFilterDesigner.rangePanel.autoRangeHint") }}
      </div>
    </div>

    <div v-if="isMemberScopeType" class="range-body">
      <div class="range-hint-text">
        {{ t("admin.dashboardFilterDesigner.rangePanel.memberScopeHint") }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  DashboardFilterAllowedRange,
  DashboardRangeSourceType,
} from "@eimsnext/models";
import { IFormDataFilterOptionItem } from "@eimsnext/services";
import { DashboardConditionFieldType } from "../fieldType";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  allowedRange?: DashboardFilterAllowedRange;
  rangeSourceType: DashboardRangeSourceType;
  currentOptions: IFormDataFilterOptionItem[];
  selectedFieldType: DashboardConditionFieldType;
}>();

const emit = defineEmits<{
  (e: "update:allowedRange", value: DashboardFilterAllowedRange): void;
}>();

const localEnabled = ref(props.allowedRange?.enabled ?? false);
const selectedIds = ref<string[]>(props.allowedRange?.items?.map((item) => item.id) || []);
const minValue = ref<any>(props.allowedRange?.min);
const maxValue = ref<any>(props.allowedRange?.max);

const rangeTypeLabel = computed(() => {
  switch (props.rangeSourceType) {
    case "staticOptions":
      return t("admin.dashboardFilterDesigner.rangePanel.staticOptions");
    case "distinctData":
      return t("admin.dashboardFilterDesigner.rangePanel.distinctData");
    case "memberScope":
      return t("admin.dashboardFilterDesigner.rangePanel.memberScope");
    case "fixedRange":
      return t("admin.dashboardFilterDesigner.rangePanel.fixedRange");
    default:
      return "";
  }
});

const isSelectType = computed(() =>
  ["staticOptions", "distinctData"].includes(props.rangeSourceType),
);

const isFixedRangeType = computed(() =>
  props.rangeSourceType == "fixedRange",
);

const isMemberScopeType = computed(() =>
  props.rangeSourceType == "memberScope",
);

const hasItems = computed(() => props.currentOptions.length > 0);

const getItemLabel = (id: string) => {
  return props.currentOptions.find((item) => item.id == id)?.label || id;
};

const emitChange = () => {
  const value: DashboardFilterAllowedRange = {
    enabled: localEnabled.value,
    items: isSelectType.value
      ? selectedIds.value.map((id) => {
          const found = props.currentOptions.find((item) => item.id == id);
          return { id, label: found?.label || id, value: found?.value ?? id };
        })
      : props.allowedRange?.items,
    min: isFixedRangeType.value ? minValue.value : props.allowedRange?.min,
    max: isFixedRangeType.value ? maxValue.value : props.allowedRange?.max,
  };
  emit("update:allowedRange", value);
};

const toggleEnabled = (val: boolean) => {
  localEnabled.value = val;
  emitChange();
};

const onItemsChange = (ids: string[]) => {
  selectedIds.value = ids;
  emitChange();
};

const removeItem = (id: string) => {
  selectedIds.value = selectedIds.value.filter((item) => item != id);
  emitChange();
};

const clearItems = () => {
  selectedIds.value = [];
  emitChange();
};

const onMinInput = (val: string | number) => {
  minValue.value = val || undefined;
  emitChange();
};

const onMaxInput = (val: string | number) => {
  maxValue.value = val || undefined;
  emitChange();
};

watch(
  () => props.allowedRange,
  (val) => {
    localEnabled.value = val?.enabled ?? false;
    selectedIds.value = val?.items?.map((item) => item.id) || [];
    minValue.value = val?.min;
    maxValue.value = val?.max;
  },
  { deep: true },
);
</script>

<style scoped lang="scss">
.range-option-panel {
  background: var(--et-bg-fill);
  border-radius: 6px;
  border: 1px solid var(--et-border-color-light);
  overflow: hidden;
}

.range-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--et-bg-container);
  border-bottom: 1px solid var(--et-border-color-light);
}

.range-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.range-source-icon {
  font-size: 14px;
}

.range-source-label {
  font-size: var(--et-font-size-13);
  font-weight: 500;
  color: var(--et-text-primary);
}

.range-body {
  padding: 12px;
}

.range-select-wrap {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 10px;
}

.range-select {
  flex: 1;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.range-empty {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-12);
  padding: 8px 0;
}

.range-hint-text {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-12);
  line-height: 1.5;
  padding: 8px 0;
}

.fixed-range-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.range-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-input-label {
  white-space: nowrap;
  font-size: var(--et-font-size-12);
  color: var(--et-text-secondary);
  min-width: 48px;
}

.range-input-row .el-input {
  flex: 1;
}
</style>
