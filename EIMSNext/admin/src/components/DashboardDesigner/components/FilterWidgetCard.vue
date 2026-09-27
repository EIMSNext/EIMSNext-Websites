<template>
  <div class="filter-widget-card">
    <div class="filter-widget-header">{{ setting.name || itemDef.name }}</div>

    <div v-if="selectedBinding?.field" class="filter-widget-body">
      <div v-if="isNoValueOp" class="no-value-hint">{{ t("admin.dashFilter.noInput") }}</div>

      <selected-tags
        v-else-if="isMemberType"
        :model-value="memberValue"
        :multiple="isMultiple"
        :editable="!isPublic"
        :empty-text="isDepartmentType ? t('comp.emptyDept') : t('comp.emptyEmp')"
        @editTag="openMemberDialog"
      />

      <div v-else-if="showRangeMode" class="range-wrapper">
        <el-input v-model="rangeValue[0]" :placeholder="t('common.minValue')" @change="emitRangeValue" />
        <el-input v-model="rangeValue[1]" :placeholder="t('common.maxValue')" @change="emitRangeValue" />
      </div>

      <el-select
        v-else-if="showOptionsMode"
        v-model="optionValue"
        :multiple="isMultiple"
        filterable
        clearable
        :placeholder="t('common.pleaseSelect')"
        class="full-width"
        @change="emitOptionValue"
      >
        <el-option v-for="item in options" :key="item.id" :label="item.label" :value="item.value ?? item.id" />
      </el-select>

      <el-input v-else v-model="textValue" :placeholder="t('common.pleaseInput')" @change="emitTextValue" />
    </div>

    <div v-else class="filter-widget-empty">{{ t("admin.dashFilter.emptyBinding") }}</div>
  </div>

  <member-select-dialog
    v-model="showMemberDialog"
    :tags="memberValue"
    :member-options="memberOptions"
    @ok="memberSelected"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  MemberSelectDialog,
  MemberTabs,
  SelectedTags,
  ISelectedTag,
} from "@eimsnext/components";
import { DashboardItemDef } from "@eimsnext/models";
import { useI18n } from "vue-i18n";
import { useFilterWidgetData } from "./useFilterWidgetData";

const { t } = useI18n();

defineOptions({
  name: "FilterWidgetCard",
});

const props = defineProps<{
  itemDef: DashboardItemDef;
  isPublic?: boolean;
}>();

const emit = defineEmits(["change"]);

const showMemberDialog = ref(false);

const {
  options,
  optionValue,
  textValue,
  rangeValue,
  memberValue,
  setting,
  selectedBinding,
  fieldTypeGroup,
  isMultiple,
  isMemberType,
  isDepartmentType,
  showRangeMode,
  isNoValueOp,
  showOptionsMode,
  memberOptions,
  applyDefaultValue,
  loadOptions,
} = useFilterWidgetData(props);

const emitValue = (value: any) => {
  emit("change", { itemId: props.itemDef.id, value });
};

const emitOptionValue = () => emitValue(optionValue.value);
const emitTextValue = () => emitValue(textValue.value);
const emitRangeValue = () => emitValue([...rangeValue.value]);

const memberSelected = (tags: ISelectedTag[]) => {
  memberValue.value = tags;
  emitValue(isMultiple.value ? tags : (tags[0] ? [tags[0]] : []));
};

const openMemberDialog = () => {
  if (props.isPublic) {
    return;
  }

  showMemberDialog.value = true;
};

onMounted(async () => {
  await loadOptions();
  const defaultValuePayload = await applyDefaultValue();
  if (defaultValuePayload) {
    emit("change", defaultValuePayload);
  }
});
</script>

<style scoped lang="scss">
.filter-widget-card {
  width: 100%;
  height: 100%;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
}

.filter-widget-header {
  font-size: var(--et-font-size-14);
  font-weight: 700;
  color: var(--et-text-primary);
}

.filter-widget-body {
  min-height: 40px;
}

.full-width {
  width: 100%;
}

.range-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.no-value-hint {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-12);
  padding: 8px 0;
}

.filter-widget-empty {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-13);
}
</style>
