<template>
  <div class="cond-value">
    <div v-if="allowFieldValue || (nodes && nodes.length > 0)" class="value-type">
      <el-select size="default" default-first-option v-model="condValueType" @change="onValueTypeChange">
        <el-option v-for="opt in condValueTypes" :label="opt.label" :value="opt.id" :key="opt.id"></el-option>
      </el-select>
    </div>
    <div class="value-value">
      <template v-if="nodes && condValueType == ConditionValueType.Field">
        <NodeFieldList v-model="condFieldValue" :nodes="nodes" :field-def="fieldDef"
          :fieldBuildSetting="fieldBuildSetting" @change="onValueChange">
        </NodeFieldList>
      </template>
      <template v-else-if="condValueType == ConditionValueType.Field">
        <FieldSelect
          v-model="condFieldValue"
          :formId="fieldDef?.formId || ''"
          :fields="fieldBuildSetting.fields"
          :use-fields="fieldBuildSetting.fields !== undefined"
          :fieldLimit="fieldBuildSetting.fieldLimit"
          @change="onValueChange"
        />
      </template>
      <template v-else>
        <template v-if="dataType == ConditionFieldType.Input">
          <template v-if="fieldDef?.field == SystemField.FlowStatus">
            <el-select size="default" filterable allow-create default-first-option v-model="value" :multiple="true"
              @change="onInput">
              <el-option v-for="opt in flowStatusArray()" :label="t(opt.i18n)" :value="opt.id"
                :key="opt.id"></el-option>
            </el-select>
          </template>
          <template v-else>
            <el-input size="default" v-model="value" @blur="onInput"></el-input>
          </template>
        </template>
        <template v-else-if="isBetweenOperator && dataType == ConditionFieldType.Number">
          <div class="range-value">
            <el-input-number size="default" v-model="rangeValue[0]" align="right" @change="onRangeInput"></el-input-number>
            <span class="range-separator">-</span>
            <el-input-number size="default" v-model="rangeValue[1]" align="right" @change="onRangeInput"></el-input-number>
          </div>
        </template>
        <template v-else-if="dataType == ConditionFieldType.Number">
          <el-input-number size="default" v-model="value" align="right" @change="onInput"></el-input-number>
        </template>
        <template v-else-if="isBetweenOperator && dataType == ConditionFieldType.TimeStamp">
          <el-date-picker size="default" v-model="rangeValue" type="datetimerange" value-format="x"
            :format="fieldDef?.format" @change="onRangeInput"></el-date-picker>
        </template>
        <template v-else-if="dataType == ConditionFieldType.TimeStamp">
          <el-date-picker size="default" v-model="value" value-format="x" :format="fieldDef?.format"
            @change="onInput"></el-date-picker>
        </template>
        <template v-else-if="dataType == ConditionFieldType.Radio">
          <el-select size="default" filterable allow-create default-first-option v-model="value" @change="onInput">
            <el-option v-for="opt in toListItem(fieldDef?.options)" :label="opt.label" :value="opt.id"
              :key="opt.id"></el-option>
          </el-select>
        </template>
        <template v-else-if="dataType == ConditionFieldType.CheckBox">
          <el-select size="default" multiple filterable allow-create default-first-option v-model="value"
            @change="onInput">
            <el-option v-for="opt in toListItem(fieldDef?.options)" :label="opt.label" :value="opt.id"
              :key="opt.id"></el-option>
          </el-select>
        </template>
        <template v-else-if="dataType == ConditionFieldType.Select1">
          <el-select size="default" filterable :allow-create="!hasDynamicSource" default-first-option v-model="value" :remote="hasDynamicSource" :remote-method="searchOptions" :loading="optionsLoading" @visible-change="loadOptions" @change="onInput">
            <el-option v-for="opt in selectOptions" :label="opt.label" :value="opt.value"
              :key="String(opt.value)"></el-option>
          </el-select>
        </template>
        <template v-else-if="dataType == ConditionFieldType.Select2">
          <el-select size="default" multiple filterable :allow-create="!hasDynamicSource" default-first-option v-model="value" :remote="hasDynamicSource" :remote-method="searchOptions" :loading="optionsLoading" @visible-change="loadOptions"
            @change="onInput">
            <el-option v-for="opt in selectOptions" :label="opt.label" :value="opt.value"
              :key="String(opt.value)"></el-option>
          </el-select>
        </template>
        <template v-else-if="dataType == ConditionFieldType.Department1">
          <selected-tags :modelValue="value" :editable="true" :empty-text="t('comp.emptyDept')"
            @editTag="selectDept(false)" />
        </template>
        <template v-else-if="dataType == ConditionFieldType.Department2">
          <selected-tags :modelValue="value" :multiple="true" :editable="true" :empty-text="t('comp.emptyDept')"
            @editTag="selectDept(true)" />
        </template>
        <template v-else-if="dataType == ConditionFieldType.Employee1">
          <selected-tags :modelValue="value" :editable="true" :empty-text="t('comp.emptyEmp')"
            @editTag="selectEmp(false)" />
        </template>
        <template v-else-if="dataType == ConditionFieldType.Employee2">
          <selected-tags :modelValue="value" :multiple="true" :editable="true" :empty-text="t('comp.emptyEmp')"
            @editTag="selectEmp(true)" />
        </template>
        <template v-else>
          <el-input size="default" v-model="value" @blur="onInput"></el-input>
        </template>
      </template>
    </div>
    <memberSelectDialog v-model="showMemberDialog" :tags="value ?? []" :memberOptions="{
      showTabs: memberShowTabs,
      multiple: memberMultiple,
    }" @ok="memberSelected">
    </memberSelectDialog>
  </div>
</template>
<script setup lang="ts">
import { ConditionValueType, IConditonValue, toListItem } from "./type";
import { FieldType, SystemField } from "@eimsnext/models";
import { IFormFieldDef } from "../FieldSelect/type";
import { FieldSelect } from "../FieldSelect";
import {
  IFieldBuildSetting,
  INodeForm,
  getConditionFieldType,
  ConditionFieldType,
} from "@/NodeFieldList/type";
import { IListItem } from "@/list/type";
import { computed, ref, watch } from "vue";
import { isDynamicSelectSource, loadDynamicSelectOptions, type DynamicSelectOption, type DynamicSelectSource } from "@eimsnext/utils";
import memberSelectDialog from "@/memberSelect/memberSelectDialog.vue";
import { useLocale } from "element-plus";
import { MemberTabs } from "@/memberSelect/type";
import { ISelectedTag } from "@/selectedTags/type";
import { DataItemType, flowStatusArray } from "@/common";
const { t } = useLocale();

defineOptions({
  name: "ConditionValue",
});
const props = defineProps<{
  modelValue: IConditonValue;
  fieldBuildSetting: IFieldBuildSetting;
  nodes?: INodeForm[];
  fieldDef?: IFormFieldDef;
  operator?: string;
  allowFieldValue?: boolean;
  optionLoader?: (source: DynamicSelectSource, keyword?: string) => Promise<DynamicSelectOption[]>;
}>();

const dataType = computed(() => {
  return getConditionFieldType(props.fieldDef?.type ?? FieldType.None);
});

const isBetweenOperator = computed(() => props.operator == "between");
const hasDynamicSource = computed(() =>
  (props.fieldDef?.type === FieldType.Select1 || props.fieldDef?.type === FieldType.Select2) &&
  isDynamicSelectSource(props.fieldDef?.source),
);
const remoteOptions = ref<DynamicSelectOption[]>([]);
const optionsLoading = ref(false);
let optionsRequestId = 0;
const selectOptions = computed(() => hasDynamicSource.value
  ? mergeSelectedOptions(remoteOptions.value, value.value)
  : toListItem(props.fieldDef?.options).map((item) => ({ label: item.label, value: item.id })));

const isMemberValueType = computed(
  () =>
    dataType.value == ConditionFieldType.Employee1 ||
    dataType.value == ConditionFieldType.Employee2 ||
    dataType.value == ConditionFieldType.Department1 ||
    dataType.value == ConditionFieldType.Department2,
);

const normalizeSelectedTags = (input: unknown): ISelectedTag[] => {
  if (Array.isArray(input)) {
    return input as ISelectedTag[];
  }

  if (input && typeof input == "object") {
    return [input as ISelectedTag];
  }

  return [];
};

const showMemberDialog = ref(false);
const memberMultiple = ref(false);
const memberShowTabs = ref(MemberTabs.None);

const condValueType = ref(props.modelValue.type);
const value = ref<any>(props.modelValue.value);
const rangeValue = ref<any[]>(Array.isArray(props.modelValue.value) ? [...props.modelValue.value] : [null, null]);
const condFieldValue = ref<IFormFieldDef>(
  props.modelValue.fieldValue ?? {
    nodeId: "",
    formId: "",
    field: "",
    label: "",
    type: FieldType.None,
  },
);

const syncFromModelValue = () => {
  condValueType.value = props.modelValue.type;
  value.value = props.modelValue.value;
  condFieldValue.value = props.modelValue.fieldValue ?? {
    nodeId: "",
    formId: "",
    field: "",
    label: "",
    type: FieldType.None,
  };

  if (
    condValueType.value == ConditionValueType.Custom &&
    isMemberValueType.value
  ) {
    value.value = normalizeSelectedTags(value.value);
  }

  rangeValue.value = Array.isArray(props.modelValue.value) ? [...props.modelValue.value] : [null, null];
};

watch(
  () => props.modelValue,
  () => {
    syncFromModelValue();
  },
  {
    deep: true,
    immediate: true,
  },
);

const condValueTypes = computed<IListItem[]>(() => [
  {
    id: ConditionValueType.Custom,
    label: t("comp.value_Custom"),
    type: DataItemType.Unknown,
  },
  {
    id: ConditionValueType.Field,
    label: t("comp.value_Field"),
    type: DataItemType.Unknown,
  },
]);

const emit = defineEmits(["update:modelValue", "change"]);

const onValueTypeChange = () => {
  props.modelValue.type = condValueType.value;
  if (
    condValueType.value == ConditionValueType.Custom &&
    isMemberValueType.value
  ) {
    value.value = [];
  }

  emitChange();
};
const onInput = () => {
  props.modelValue.value = value.value;

  emitChange();
};
const loadOptions = async (visible = true) => {
  if (!visible || !hasDynamicSource.value || !props.fieldDef?.source || remoteOptions.value.length || optionsLoading.value) return;
  await searchOptions("");
};
const searchOptions = async (keyword: string) => {
  if (!hasDynamicSource.value || !props.fieldDef?.source) return;
  const requestId = ++optionsRequestId;
  optionsLoading.value = true;
  try {
    const options = await (props.optionLoader || loadDynamicSelectOptions)(props.fieldDef.source, keyword);
    if (requestId === optionsRequestId) {
      remoteOptions.value = options;
    }
  } catch {
    if (requestId === optionsRequestId) {
      remoteOptions.value = [];
    }
  } finally {
    if (requestId === optionsRequestId) {
      optionsLoading.value = false;
    }
  }
};
const mergeSelectedOptions = (options: DynamicSelectOption[], selected: unknown): DynamicSelectOption[] => {
  const selectedValues = Array.isArray(selected) ? selected : selected === undefined || selected === null ? [] : [selected];
  const result = [...options];
  selectedValues.forEach((item) => {
    const selectedValue = item && typeof item === "object" ? (item as { value?: unknown }).value : item;
    if (selectedValue === undefined || selectedValue === null || result.some((option) => String(option.value) === String(selectedValue))) return;
    result.push({ label: String(selectedValue), value: selectedValue as string | number | boolean });
  });
  return result;
};

watch(
  () => props.fieldDef?.source,
  () => {
    optionsRequestId += 1;
    remoteOptions.value = [];
    loadOptions(true);
  },
  { deep: true, immediate: true },
);
const onRangeInput = () => {
  props.modelValue.value = [...rangeValue.value];
  emitChange();
};
const onValueChange = () => {
  props.modelValue.fieldValue = condFieldValue.value;

  emitChange();
};
const emitChange = () => {
  emit("update:modelValue", props.modelValue);
  emit("change", props.modelValue);
};

const selectDept = (multiple: boolean) => {
  memberShowTabs.value = MemberTabs.Department | MemberTabs.CurDept;
  memberMultiple.value = multiple;
  showMemberDialog.value = true;
};
const selectEmp = (multiple: boolean) => {
  memberShowTabs.value = MemberTabs.Employee | MemberTabs.CurUser;
  memberMultiple.value = multiple;
  showMemberDialog.value = true;
};
const memberSelected = (members: ISelectedTag[]) => {
  value.value = members;
  props.modelValue.type = ConditionValueType.Custom;
  props.modelValue.value = members;
  showMemberDialog.value = false;

  emitChange();
};
</script>

<style scoped lang="scss">
.cond-value {
  width: 100%;
  display: flex;

  .value-type {
    width: var(--et-size-100);
    margin-right: var(--et-space-5);
  }

  .value-value {
    flex: 1;
  }

  .range-value {
    display: flex;
    align-items: center;
    gap: var(--et-space-8);
  }

  .range-separator {
    color: var(--et-text-secondary);
  }

  :deep(.selected-tags) {
    height: var(--et-size-32);
    overflow: hidden;
    padding: var(--et-space-3);
  }
}
</style>
