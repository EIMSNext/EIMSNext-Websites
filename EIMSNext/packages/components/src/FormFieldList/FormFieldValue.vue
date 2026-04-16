<template>
  <div class="field-value">
    <div class="value-type">
      <el-select
        size="default"
        default-first-option
        v-model="fieldValueType"
        @change="onValueTypeChange"
      >
        <el-option
          v-for="opt in fieldValueTypes"
          :label="opt.label"
          :value="opt.id"
          :key="opt.id"
        ></el-option>
      </el-select>
    </div>
    <div class="value-value">
      <template v-if="fieldValueType == FieldValueType.Custom">
        <template
          v-if="
            fieldType == FieldType.Input ||
            fieldType == FieldType.Select1 ||
            fieldType == FieldType.Select2
          "
        >
          <el-input v-model="value" size="default" @change="onInput"></el-input>
        </template>
        <template v-if="fieldType == FieldType.Number">
          <el-input-number
            v-model="value"
            size="default"
            class="auto-width-input-number"
            @change="onInput"
          ></el-input-number>
        </template>
        <template v-if="fieldType == FieldType.TimeStamp">
          <el-date-picker
            size="default"
            v-model="value"
            value-format="x"
            :format="fieldDef?.format"
            :type="dateType"
            @change="onInput"
          ></el-date-picker>
        </template>

        <template v-else-if="fieldType == FieldType.Radio">
          <el-select
            size="default"
            filterable
            allow-create
            default-first-option
            v-model="value"
            @change="onInput"
          >
            <el-option
              v-for="opt in toListItem(fieldDef?.options)"
              :label="opt.label"
              :value="opt.id"
              :key="opt.id"
            ></el-option>
          </el-select>
        </template>
        <template v-else-if="fieldType == FieldType.CheckBox">
          <el-select
            size="default"
            multiple
            filterable
            allow-create
            default-first-option
            v-model="value"
            @change="onInput"
          >
            <el-option
              v-for="opt in toListItem(fieldDef?.options)"
              :label="opt.label"
              :value="opt.id"
              :key="opt.id"
            ></el-option>
          </el-select>
        </template>
        <template v-else-if="fieldType == FieldType.Department1">
          <selected-tags
            :modelValue="value"
            :editable="true"
            :empty-text="t('comp.emptyDept')"
            @editTag="selectDept(false)"
          />
        </template>
        <template v-else-if="fieldType == FieldType.Department2">
          <selected-tags
            :modelValue="value"
            :multiple="true"
            :editable="true"
            :empty-text="t('comp.emptyDept')"
            @editTag="selectDept(true)"
          />
        </template>
        <template v-else-if="fieldType == FieldType.Employee1">
          <selected-tags
            :modelValue="value"
            :editable="true"
            :empty-text="t('comp.emptyEmp')"
            @editTag="selectEmp(false)"
          />
        </template>
        <template v-else-if="fieldType == FieldType.Employee2">
          <selected-tags
            :modelValue="value"
            :multiple="true"
            :editable="true"
            :empty-text="t('comp.emptyEmp')"
            @editTag="selectEmp(true)"
          />
        </template>
      </template>
      <template v-if="fieldValueType == FieldValueType.Field">
        <NodeFieldList
          ref="nodefieldlist"
          v-model="fieldFieldValue"
          :nodes="nodes"
          :field-def="fieldDef"
          :fieldBuildSetting="fieldSetting"
          @change="onValueChange"
        ></NodeFieldList>
      </template>
      <template v-if="fieldValueType == FieldValueType.Formula">
        <div class="formula-value-panel">
          <el-button @click="showFormulaEditor = true">
            {{ formulaButtonText }}
          </el-button>
          <FormulaEditorDialog
            v-model="formulaValue"
            v-model:visible="showFormulaEditor"
            :nodes="nodes"
            @update:modelValue="onFormulaChange"
          />
        </div>
      </template>
    </div>
    <memberSelectDialog
      v-model="showMemberDialog"
      :tags="value ?? []"
      :memberOptions="{
        showTabs: memberShowTabs,
        multiple: memberMultiple,
      }"
      @ok="memberSelected"
    >
    </memberSelectDialog>
  </div>
</template>
<script setup lang="ts">
import { IFormulaValue, IFormFieldValue, FieldValueType } from "./type";
import { FieldDef, FieldType } from "@eimsnext/models";
import {
  FieldBuildRule,
  IFieldBuildSetting,
  INodeForm,
} from "../NodeFieldList/type";
import { useLocale } from "element-plus";
import { IFormFieldDef } from "@/FieldSelect/type";
import { computed, ref } from "vue";
import { IListItem } from "@/list/type";
import { toListItem } from "@/ConditionList/type";
import { MemberTabs } from "@/memberSelect/type";
import { ISelectedTag } from "@/selectedTags/type";
import { DataItemType } from "@/common";
import FormulaEditorDialog from "@/FlowDesigner/Dataflow/FormulaEditorDialog.vue";
import { normalizeFormulaValue } from "@/FlowDesigner/Dataflow/formula";

const { t } = useLocale();

defineOptions({
  name: "FormFieldValue",
});
const props = defineProps<{
  modelValue: IFormFieldValue;
  fieldDef: IFormFieldDef;
  nodes: INodeForm[];
  fieldSetting: IFieldBuildSetting;
  fieldValueChanging?: (
    field: IFormFieldDef,
    oldVal?: IFormFieldDef,
    newVal?: IFormFieldDef,
  ) => Promise<boolean>;
  siblingFields?: any[];
}>();

const showMemberDialog = ref(false);
const memberMultiple = ref(false);
const memberShowTabs = ref(MemberTabs.None);
const showFormulaEditor = ref(false);

const fieldType = computed(() => props.fieldDef.type);
const dateType = computed(() =>
  (
    (props.fieldDef.type == FieldType.TimeStamp
      ? props.fieldDef.format
      : undefined) ?? "yyyy-MM-dd"
  ).includes("HH")
    ? "datetime"
    : "date",
);

const fieldValueType = ref(props.modelValue.type);
const value = ref<any>(props.modelValue.value);
if (
  !value.value &&
  fieldValueType.value == FieldValueType.Custom &&
  (fieldType.value == FieldType.Employee1 ||
    fieldType.value == FieldType.Employee2 ||
    fieldType.value == FieldType.Department1 ||
    fieldType.value == FieldType.Department2 ||
    fieldType.value == FieldType.CheckBox ||
    fieldType.value == FieldType.Select2)
) {
  value.value = [];
}

if (
  fieldValueType.value == FieldValueType.Custom &&
  (fieldType.value == FieldType.Employee1 ||
    fieldType.value == FieldType.Department1) &&
  !Array.isArray(value.value)
) {
  value.value = [value.value];
}

const fieldFieldValue = ref<IFormFieldDef>(
  props.modelValue.fieldValue ?? {
    nodeId: "",
    formId: "",
    field: "",
    label: "",
    type: FieldType.None,
  },
);
const formulaValue = ref<IFormulaValue | undefined>(props.modelValue.formulaValue);

const fieldValueTypes: IListItem[] = [
  {
    id: FieldValueType.Custom,
    label: t("comp.value_Custom"),
    type: DataItemType.Unknown,
  },
  {
    id: FieldValueType.Field,
    label: t("comp.value_Field"),
    type: DataItemType.Unknown,
  },
  {
    id: FieldValueType.Formula,
    label: t("dataflow.formula"),
    type: DataItemType.Unknown,
  },
  {
    id: FieldValueType.Empty,
    label: t("comp.value_Empty"),
    type: DataItemType.Unknown,
  },
];

const formulaButtonText = computed(() => {
  const exp = formulaValue.value?.expression?.trim();
  if (!exp) return t("dataflow.setFormula");
  return exp.length > 24 ? `${exp.slice(0, 24)}...` : exp;
});

const emit = defineEmits(["update:modelValue", "change"]);
const onValueTypeChange = () => {
  props.modelValue.type = fieldValueType.value;

  if (
    fieldValueType.value == FieldValueType.Custom &&
    (fieldType.value == FieldType.Employee1 ||
      fieldType.value == FieldType.Employee2 ||
      fieldType.value == FieldType.Department1 ||
      fieldType.value == FieldType.Department2 ||
      fieldType.value == FieldType.CheckBox ||
      fieldType.value == FieldType.Select2)
  ) {
    value.value = [];
  }

  if (fieldValueType.value != FieldValueType.Formula) {
    delete props.modelValue.formulaValue;
  }

  emitChange();
};
const onInput = () => {
  props.modelValue.value = value.value;

  emitChange();
};
const onValueChange = async (newVal?: IFormFieldDef) => {
  let oldVal = props.modelValue.fieldValue;
  if (
    !props.fieldValueChanging ||
    (await props.fieldValueChanging(
      props.fieldDef,
      props.modelValue.fieldValue,
      fieldFieldValue.value,
    ))
  ) {
    if (fieldFieldValue.value.field == "") delete props.modelValue.fieldValue;
    else props.modelValue.fieldValue = fieldFieldValue.value;
  } else {
    if (oldVal) {
      fieldFieldValue.value = oldVal;
    } else {
      fieldFieldValue.value = {
        nodeId: "",
        formId: "",
        field: "",
        label: "",
        type: FieldType.None,
      };
    }
  }
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
  props.modelValue.type = FieldValueType.Custom;
  props.modelValue.value = members;
  showMemberDialog.value = false;

  emitChange();
};

const onFormulaChange = (newVal?: IFormulaValue) => {
  const normalized = normalizeFormulaValue(
    newVal,
    props.fieldDef,
    (props.siblingFields ?? []) as any,
  );
  formulaValue.value = normalized;
  props.modelValue.type = FieldValueType.Formula;
  props.modelValue.formulaValue = normalized;
  delete props.modelValue.value;
  delete props.modelValue.fieldValue;
  emitChange();
};

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
    width: var(--et-size-100);
    margin-right: var(--et-space-5);
  }

  .value-value {
    flex: 1;
  }
}

.auto-width-input-number {
  width: auto;
}

.formula-value-panel {
  display: flex;
  align-items: center;
}
</style>
