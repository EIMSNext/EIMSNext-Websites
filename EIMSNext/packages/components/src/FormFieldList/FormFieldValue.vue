<template>
  <div class="field-value">
    <div class="value-type">
      <el-select size="default" default-first-option v-model="fieldValueType" @change="onValueTypeChange">
        <el-option v-for="opt in fieldValueTypes" :label="opt.label" :value="opt.id" :key="opt.id"></el-option>
      </el-select>
    </div>
    <div class="value-value">
      <template v-if="fieldValueType == FieldValueType.Custom">
        <template
          v-if="fieldType == FieldType.Input || fieldType == FieldType.Select || fieldType == FieldType.Select2">
          <el-input v-model="value" size="default" @change="onInput"></el-input>
        </template>
        <template v-if="fieldType == FieldType.Number">
          <el-input-number v-model="value" size="default" style="width: auto" @change="onInput"></el-input-number>
        </template>
        <template v-if="fieldType == FieldType.TimeStamp">
          <el-date-picker size="default" v-model="value" value-format="x" :format="fieldDef?.format" :type="dateType"
            @change="onInput"></el-date-picker>
        </template>

        <template v-else-if="fieldType == FieldType.Radio">
          <el-select size="default" filterable allow-create default-first-option v-model="value" @change="onInput">
            <el-option v-for="opt in toListItem(fieldDef?.options)" :label="opt.label" :value="opt.id"
              :key="opt.id"></el-option>
          </el-select>
        </template>
        <template v-else-if="fieldType == FieldType.CheckBox">
          <el-select size="default" multiple filterable allow-create default-first-option v-model="value"
            @change="onInput">
            <el-option v-for="opt in toListItem(fieldDef?.options)" :label="opt.label" :value="opt.id"
              :key="opt.id"></el-option>
          </el-select>
        </template>
        <template v-else-if="fieldType == FieldType.DepartmentSelect">
          <selected-tags :modelValue="value" :editable="true" :empty-text="t('comp.emptyDept')"
            @editTag="selectDept(false)" />
        </template>
        <template v-else-if="fieldType == FieldType.DepartmentSelect2">
          <selected-tags :modelValue="value" :multiple="true" :editable="true" :empty-text="t('comp.emptyDept')"
            @editTag="selectDept(true)" />
        </template>
        <template v-else-if="fieldType == FieldType.EmployeeSelect">
          <selected-tags :modelValue="value" :editable="true" :empty-text="t('comp.emptyEmp')"
            @editTag="selectEmp(false)" />
        </template>
        <template v-else-if="fieldType == FieldType.EmployeeSelect2">
          <selected-tags :modelValue="value" :multiple="true" :editable="true" :empty-text="t('comp.emptyEmp')"
            @editTag="selectEmp(true)" />
        </template>
      </template>
      <template v-if="fieldValueType == FieldValueType.Field">
        <NodeFieldList ref="nodefieldlist" v-model="fieldFieldValue" :nodes="nodes" :field-def="fieldDef"
          :fieldBuildSetting="fieldSetting" @change="onValueChange"></NodeFieldList>
      </template>
    </div>
    <memberSelectDialog v-model="showMemberDialog" :tags="value ?? []" :multiple="memberMultiple"
      :showTabs="memberShowTabs" @ok="memberSelected">
    </memberSelectDialog>
  </div>
</template>
<script setup lang="ts">
import { IFormFieldValue, FieldValueType } from "./type";
import { FieldDef, FieldType } from "@eimsnext/models";
import { FieldBuildRule, IFieldBuildSetting, INodeForm } from "../NodeFieldList/type";
import { useLocale } from "element-plus";
import { IFormFieldDef } from "@/FieldSelect/type";
import { computed, ref } from "vue";
import { IListItem } from "@/list/type";
import { toListItem } from "@/ConditionList/type";
import { MemberTabs } from "@/memberSelect/type";
import { ISelectedTag } from "@/selectedTags/type";

const { t } = useLocale();

defineOptions({
  name: "FormFieldValue",
});
const props = defineProps<{
  modelValue: IFormFieldValue;
  fieldDef: IFormFieldDef;
  nodes: INodeForm[];
  fieldSetting: IFieldBuildSetting;
  fieldValueChanging?: (field: IFormFieldDef, oldVal?: IFormFieldDef, newVal?: IFormFieldDef) => Promise<boolean>;
}>();

const showMemberDialog = ref(false)
const memberMultiple = ref(false)
const memberShowTabs = ref(MemberTabs.None)

const fieldType = computed(() => props.fieldDef.type);
const dateType = computed(() => ((props.fieldDef.type == FieldType.TimeStamp ? props.fieldDef.format : undefined) ?? "yyyy-MM-dd").includes("HH") ? "datetime" : "date");

const fieldValueType = ref(props.modelValue.type);
const value = ref<any>(props.modelValue.value);
if (!value.value && fieldValueType.value == FieldValueType.Custom
  && (fieldType.value == FieldType.EmployeeSelect ||
    fieldType.value == FieldType.EmployeeSelect2 ||
    fieldType.value == FieldType.DepartmentSelect ||
    fieldType.value == FieldType.DepartmentSelect2 ||
    fieldType.value == FieldType.CheckBox ||
    fieldType.value == FieldType.Select2
  )
) {
  value.value = []
}

if (fieldValueType.value == FieldValueType.Custom
  && (fieldType.value == FieldType.EmployeeSelect ||
    fieldType.value == FieldType.DepartmentSelect
  ) && !Array.isArray(value.value)) {
  value.value = [value.value]
}

const fieldFieldValue = ref<IFormFieldDef>(
  props.modelValue.fieldValue ?? {
    nodeId: "",
    formId: "",
    field: "",
    label: "",
    type: FieldType.None,
  }
);

const fieldValueTypes: IListItem[] = [
  { id: FieldValueType.Custom, label: t("comp.value_Custom") },
  { id: FieldValueType.Field, label: t("comp.value_Field") },
  { id: FieldValueType.Empty, label: t("comp.value_Empty") },
];


const emit = defineEmits(["update:modelValue", "change"]);
const onValueTypeChange = () => {
  props.modelValue.type = fieldValueType.value;

  if (fieldValueType.value == FieldValueType.Custom
    && (fieldType.value == FieldType.EmployeeSelect ||
      fieldType.value == FieldType.EmployeeSelect2 ||
      fieldType.value == FieldType.DepartmentSelect ||
      fieldType.value == FieldType.DepartmentSelect2 ||
      fieldType.value == FieldType.CheckBox ||
      fieldType.value == FieldType.Select2
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
const onValueChange = async (newVal?: IFormFieldDef) => {
  let oldVal = props.modelValue.fieldValue
  // console.log("value change", oldVal, newVal)
  if (!props.fieldValueChanging || await props.fieldValueChanging(props.fieldDef, props.modelValue.fieldValue, fieldFieldValue.value)) {
    // console.log("ok changing")
    if (fieldFieldValue.value.field == "")
      delete props.modelValue.fieldValue
    else
      props.modelValue.fieldValue = fieldFieldValue.value;
  } else {
    // console.log("cancel changing")
    if (oldVal) {
      fieldFieldValue.value = oldVal
    }
    else {
      fieldFieldValue.value = {
        nodeId: "",
        formId: "",
        field: "",
        label: "",
        type: FieldType.None,
      }
    }
  }
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
  props.modelValue.type = FieldValueType.Custom
  props.modelValue.value = members;
  showMemberDialog.value = false

  emitChange();
}

const emitChange = () => {
  emit("update:modelValue", props.modelValue);
  emit("change", props.modelValue);
};
</script>

<style scoped lang="scss">
.field-value {
  flex: 1;
  display: flex;

  .value-type {
    width: 100px;
    margin-right: 5px;
  }

  .value-value {
    flex: 1;
  }
}
</style>
