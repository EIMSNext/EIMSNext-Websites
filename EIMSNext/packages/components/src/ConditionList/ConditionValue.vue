<template>
  <div class="cond-value">
    <div v-if="nodes && nodes.length > 0" class="value-type">
      <el-select size="default" default-first-option v-model="condValueType" @change="onValueTypeChange">
        <el-option v-for="opt in condValueTypes" :label="opt.label" :value="opt.id" :key="opt.id"></el-option>
      </el-select>
    </div>
    <div class="value-value">
      <template v-if="nodes && condValueType == ConditionValueType.Field">
        <NodeFieldList v-model="condFieldValue" :nodes="nodes" :field-def="props.fieldDef"
          :fieldBuildSetting="fieldBuildSetting" @change="onValueChange">
        </NodeFieldList>
      </template>
      <template v-else>
        <template v-if="dataType == ConditionFieldType.Input">
          <el-input size="default" v-model="value" @blur="onInput"></el-input>
        </template>
        <template v-else-if="dataType == ConditionFieldType.Number">
          <el-input-number size="default" v-model="value" @change="onInput"></el-input-number>
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
        <template v-else-if="dataType == ConditionFieldType.Select">
          <el-select size="default" filterable allow-create default-first-option v-model="value" @change="onInput">
            <el-option v-for="opt in toListItem(fieldDef?.options)" :label="opt.label" :value="opt.id"
              :key="opt.id"></el-option>
          </el-select>
        </template>
        <template v-else-if="dataType == ConditionFieldType.Select2">
          <el-select size="default" multiple filterable allow-create default-first-option v-model="value"
            @change="onInput">
            <el-option v-for="opt in toListItem(fieldDef?.options)" :label="opt.label" :value="opt.id"
              :key="opt.id"></el-option>
          </el-select>
        </template>
        <template v-else-if="dataType == ConditionFieldType.DepartmentSelect">
          <selected-tags :modelValue="value" :editable="true" :empty-text="t('comp.emptyDept')"
            @editTag="selectDept(false)" />
        </template>
        <template v-else-if="dataType == ConditionFieldType.DepartmentSelect2">
          <selected-tags :modelValue="value" :multiple="true" :editable="true" :empty-text="t('comp.emptyDept')"
            @editTag="selectDept(true)" />
        </template>
        <template v-else-if="dataType == ConditionFieldType.EmployeeSelect">
          <selected-tags :modelValue="value" :editable="true" :empty-text="t('comp.emptyEmp')"
            @editTag="selectEmp(false)" />
        </template>
        <template v-else-if="dataType == ConditionFieldType.EmployeeSelect2">
          <selected-tags :modelValue="value" :multiple="true" :editable="true" :empty-text="t('comp.emptyEmp')"
            @editTag="selectEmp(true)" />
        </template>
        <template v-else>
          <el-input size="default" v-model="value" @blur="onInput"></el-input>
        </template>
      </template>
    </div>
    <memberSelectDialog v-model="showMemberDialog" :tags="value ?? []" :multiple="memberMultiple"
      :showTabs="memberShowTabs" @ok="memberSelected">
    </memberSelectDialog>
  </div>
</template>
<script setup lang="ts">
import { ConditionValueType, IConditonValue, toListItem } from "./type";
import { FieldType } from "@eimsnext/models";
import { IFormFieldDef } from "../FieldSelect/type";
import { IFieldBuildSetting, INodeForm, getConditionFieldType, ConditionFieldType } from "@/NodeFieldList/type";
import { IListItem } from "@/list/type";
import { computed, ref, toRef } from "vue";
import memberSelectDialog from "@/memberSelect/memberSelectDialog.vue";
import { useLocale } from "element-plus";
import { MemberTabs } from "@/memberSelect/type";
import { ISelectedTag } from "@/selectedTags/type";
const { t } = useLocale();

defineOptions({
  name: "ConditionValue",
});
const props = defineProps<{
  modelValue: IConditonValue;
  fieldBuildSetting: IFieldBuildSetting;
  nodes?: INodeForm[];
  fieldDef?: IFormFieldDef;
}>();

const dataType = computed(() => {
  return getConditionFieldType(props.fieldDef?.type ?? FieldType.None)
});

const showMemberDialog = ref(false)
const memberMultiple = ref(false)
const memberShowTabs = ref(MemberTabs.None)

const condValueType = toRef(props.modelValue.type);
const value = toRef<any>(props.modelValue.value);
if (!value.value && condValueType.value == ConditionValueType.Custom
  && (dataType.value == ConditionFieldType.EmployeeSelect ||
    dataType.value == ConditionFieldType.EmployeeSelect2 ||
    dataType.value == ConditionFieldType.DepartmentSelect ||
    dataType.value == ConditionFieldType.DepartmentSelect2
  )
) {
  value.value = []
}
const condFieldValue = ref<IFormFieldDef>(
  props.modelValue.fieldValue ?? {
    nodeId: "",
    formId: "",
    field: "",
    label: "",
    type: FieldType.None,
  }
);

const condValueTypes: IListItem[] = [
  { id: ConditionValueType.Custom, label: t("comp.value_Custom") },
  { id: ConditionValueType.Field, label: t("comp.value_Field") },
];

const emit = defineEmits(["update:modelValue", "change"]);

const onValueTypeChange = () => {
  props.modelValue.type = condValueType.value;
  if (condValueType.value == ConditionValueType.Custom
    && (dataType.value == ConditionFieldType.EmployeeSelect ||
      dataType.value == ConditionFieldType.EmployeeSelect2 ||
      dataType.value == ConditionFieldType.DepartmentSelect ||
      dataType.value == ConditionFieldType.DepartmentSelect2
    )
  ) {
    value.value = []
  }

  emitChange();
};
const onInput = () => {
  props.modelValue.value = value.value;

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
  memberShowTabs.value = MemberTabs.Department | MemberTabs.CurDept
  memberMultiple.value = multiple;
  showMemberDialog.value = true
}
const selectEmp = (multiple: boolean) => {
  memberShowTabs.value = MemberTabs.Employee | MemberTabs.CurUser
  memberMultiple.value = multiple;
  showMemberDialog.value = true
}
const memberSelected = (members: ISelectedTag[]) => {
  value.value = members
  props.modelValue.type = ConditionValueType.Custom
  props.modelValue.value = members;
  showMemberDialog.value = false

  emitChange();
}
</script>

<style scoped lang="scss">
.cond-value {
  width: 100%;
  display: flex;

  .value-type {
    width: 100px;
    margin-right: 5px;
  }

  .value-value {
    flex: 1;
  }

  :deep(.selected-tags) {
    height: 32px;
    overflow: hidden;
    padding: 3px
  }
}
</style>
