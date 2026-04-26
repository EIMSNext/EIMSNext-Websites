<template>
  <div class="cond-value">
    <div v-if="nodes && nodes.length > 0" class="value-type">
      <el-select
        size="default"
        default-first-option
        v-model="condValueType"
        @change="onValueTypeChange"
      >
        <el-option
          v-for="opt in condValueTypes"
          :label="opt.label"
          :value="opt.id"
          :key="opt.id"
        ></el-option>
      </el-select>
    </div>
    <div class="value-value">
      <template v-if="nodes && condValueType == ConditionValueType.Field">
        <NodeFieldList
          v-model="condFieldValue"
          :nodes="nodes"
          :field-def="fieldDef"
          :fieldBuildSetting="fieldBuildSetting"
          @change="onValueChange"
        >
        </NodeFieldList>
      </template>
      <template v-else>
        <template v-if="dataType == ConditionFieldType.Input">
          <template v-if="fieldDef?.field == SystemField.FlowStatus">
            <el-select
              size="default"
              filterable
              allow-create
              default-first-option
              v-model="value"
              :multiple="true"
              @change="onInput"
            >
              <el-option
                v-for="opt in flowStatusArray()"
                :label="t(opt.i18n)"
                :value="opt.id"
                :key="opt.id"
              ></el-option>
            </el-select>
          </template>
          <template v-else>
            <el-input size="default" v-model="value" @blur="onInput"></el-input>
          </template>
        </template>
        <template v-else-if="dataType == ConditionFieldType.Number">
          <el-input-number
            size="default"
            v-model="value"
            @change="onInput"
          ></el-input-number>
        </template>
        <template v-else-if="dataType == ConditionFieldType.TimeStamp">
          <el-date-picker
            size="default"
            v-model="value"
            value-format="x"
            :format="fieldDef?.format"
            @change="onInput"
          ></el-date-picker>
        </template>
        <template v-else-if="dataType == ConditionFieldType.Radio">
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
        <template v-else-if="dataType == ConditionFieldType.CheckBox">
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
        <template v-else-if="dataType == ConditionFieldType.Select1">
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
        <template v-else-if="dataType == ConditionFieldType.Select2">
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
        <template v-else-if="dataType == ConditionFieldType.Department1">
          <selected-tags
            :modelValue="value"
            :editable="true"
            :empty-text="t('comp.emptyDept')"
            @editTag="selectDept(false)"
          />
        </template>
        <template v-else-if="dataType == ConditionFieldType.Department2">
          <selected-tags
            :modelValue="value"
            :multiple="true"
            :editable="true"
            :empty-text="t('comp.emptyDept')"
            @editTag="selectDept(true)"
          />
        </template>
        <template v-else-if="dataType == ConditionFieldType.Employee1">
          <selected-tags
            :modelValue="value"
            :editable="true"
            :empty-text="t('comp.emptyEmp')"
            @editTag="selectEmp(false)"
          />
        </template>
        <template v-else-if="dataType == ConditionFieldType.Employee2">
          <selected-tags
            :modelValue="value"
            :multiple="true"
            :editable="true"
            :empty-text="t('comp.emptyEmp')"
            @editTag="selectEmp(true)"
          />
        </template>
        <template v-else>
          <el-input size="default" v-model="value" @blur="onInput"></el-input>
        </template>
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
import { ConditionValueType, IConditonValue, toListItem } from "./type";
import { FieldType, SystemField } from "@eimsnext/models";
import { IFormFieldDef } from "../FieldSelect/type";
import {
  IFieldBuildSetting,
  INodeForm,
  getConditionFieldType,
  ConditionFieldType,
} from "@/NodeFieldList/type";
import { IListItem } from "@/list/type";
import { computed, ref, toRef } from "vue";
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
}>();

const dataType = computed(() => {
  return getConditionFieldType(props.fieldDef?.type ?? FieldType.None);
});

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

const condValueType = toRef(props.modelValue.type);
const value = toRef<any>(props.modelValue.value);
if (
  condValueType.value == ConditionValueType.Custom &&
  isMemberValueType.value
) {
  value.value = normalizeSelectedTags(value.value);
}
const condFieldValue = ref<IFormFieldDef>(
  props.modelValue.fieldValue ?? {
    nodeId: "",
    formId: "",
    field: "",
    label: "",
    type: FieldType.None,
  },
);

const condValueTypes: IListItem[] = [
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
];

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

  :deep(.selected-tags) {
    height: var(--et-size-32);
    overflow: hidden;
    padding: var(--et-space-3);
  }
}
</style>
