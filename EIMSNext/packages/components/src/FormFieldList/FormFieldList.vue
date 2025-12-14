<template>
  <div class="field-list">
    <el-dropdown v-if="!showAll" :hide-on-click="false" trigger="click" popper-class="data-triggers"
      @command="addingField">
      <el-button class="btn-add-trigger">
        {{ "+ " + t("选择字段") }}
      </el-button>
      <template #dropdown>
        <el-dropdown-menu class="trigger-header">
          <template v-for="field in allFields" :key="field.field.field">
            <el-dropdown-item class="add-trigger"
              :disabled="!!selectedFields.items.find((x) => x.field.field == field.field.field)" :class="{
                notAllow: selectedFields.items.find((x) => x.field.field == field.field.field),
              }" :command="field">
              {{ field.field.label }}
            </el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <template v-for="(item, idx) in selectedFields.items" :key="item.field.field">
      <FormFieldItem :modelValue="item" :nodes="nodes" :field-setting="fieldSetting" :removable="!showAll"
        :fieldValueChanging="fieldValueChanging" @change="onInput" @remove="onRemove"></FormFieldItem>
    </template>
  </div>
</template>
<script setup lang="ts">
import { FormDef, FieldDef, FieldType } from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import { useLocale } from "element-plus";
import { IFormFieldList, IFormFieldItem, buildFormFieldList, FieldValueType, FormFieldListInstance } from "./type";
import {
  FieldBuildRule,
  IFieldBuildSetting,
  IFormFieldMap,
  INodeForm,
} from "../NodeFieldList/type";
import { nextTick, onMounted, ref, toRef, watch } from "vue";
import { IFormFieldDef, splitSubField } from "@/FieldList/type";
const { t } = useLocale();

defineOptions({
  name: "FormFieldList",
});

const props = withDefaults(
  defineProps<{
    modelValue: IFormFieldList;
    nodeId: string;
    formId: string;
    nodes: INodeForm[];
    showAll?: boolean;
    fieldSelecting?: (fieldItem: IFormFieldItem) => Promise<boolean>;
    fieldValueChanging?: (field: IFormFieldDef, oldVal?: IFormFieldDef, newVal?: IFormFieldDef) => Promise<boolean>;
  }>(),
  {
    showAll: true,
  }
);

const allFields = ref<IFormFieldItem[]>([]);
const selectedFields = toRef<IFormFieldList>(props.modelValue);
const fieldSetting = ref<IFieldBuildSetting>({
  version: 0,
  rule: FieldBuildRule.OneLevelTable,
  matchType: true,
  fieldMapping: {},
});

const formStore = useFormStore();
const formDef = ref<FormDef>();

const emit = defineEmits(["update:modelValue", "change"]);

const addingField = async (fieldItem: IFormFieldItem) => {
  // console.log("addingField", fieldItem)
  if (!props.fieldSelecting || await props.fieldSelecting(fieldItem)) {
    selectedFields.value.items.push(fieldItem);
    emitChange()
  }
};

const onRemove = (fieldItem: IFormFieldItem) => {
  if (fieldItem && selectedFields.value.items) {
    let index = selectedFields.value.items.findIndex((x) => x.field == fieldItem.field);
    if (index > -1) {
      selectedFields.value.items.splice(index, 1);
    }
  }

  emitChange();
};

const onInput = (fieldItem: IFormFieldItem) => {
  // console.log("field item changed", fieldItem.field, selectedFields.value.items);
  if (fieldItem && selectedFields.value.items) {
    let item = selectedFields.value.items.find((x) => x.field.field == fieldItem.field.field);
    // console.log("field item changed", fieldItem.field, item)
    if (item) {
      item.field = fieldItem.field;
      item.value = fieldItem.value;
    }

    updateFieldSetting();
  }
  emitChange();
};

const updateFieldSetting = () => {
  // console.log("field mapping", selectedFields.value)
  let mapping: Record<string, IFormFieldMap> = {};
  selectedFields.value.items.forEach((x) => {
    if (
      x.value.type == FieldValueType.Field &&
      x.value.fieldValue &&
      (!x.value.fieldValue.singleResultNode || x.value.fieldValue.isSubField)
    ) {
      // console.log("field mapping xxx", x)
      let mapMainField = x.value.fieldValue.isSubField
        ? splitSubField(x.value.fieldValue.field)[0]
        : "master";
      if (x.field.isSubField) {
        let mainField = splitSubField(x.field.field)[0];
        if (!mapping[mainField]) {
          let fieldMap: IFormFieldMap = {
            mainField: mainField,
            sourceField: x.field.field,
            mapMainField: mapMainField,
            mapField: x.value.fieldValue.field,
            mapNodeId: x.value.fieldValue.nodeId,
            mapSingleResult: x.value.fieldValue.singleResultNode ?? true,
            mapCount: 1,
          };
          mapping[mainField] = fieldMap;
        } else {
          mapping[mainField].mapCount++;
        }
      } else {
        if (!mapping["master"]) {
          let fieldMap: IFormFieldMap = {
            mainField: "master",
            sourceField: x.field.field,
            mapMainField: mapMainField,
            mapField: x.value.fieldValue.field,
            mapNodeId: x.value.fieldValue.nodeId,
            mapSingleResult: x.value.fieldValue.singleResultNode ?? true,
            mapCount: 1,
          };
          mapping["master"] = fieldMap;
        } else {
          mapping["master"].mapCount++;
        }
      }
    }
  });

  fieldSetting.value.fieldMapping = mapping;
  fieldSetting.value.version += 1;
  // console.log("field mapping updated", fieldSetting)
};

const emitChange = () => {
  emit("update:modelValue", selectedFields.value);
  emit("change", selectedFields.value);
};

onMounted(() => {
  nextTick(() => updateFieldSetting());
})

watch(
  [() => props.formId],
  async ([newFormId], [oldFormId]) => {
    if (newFormId && newFormId != oldFormId) {
      let form = await formStore.get(newFormId);
      if (form && form.content && form.content.items) {
        allFields.value = buildFormFieldList(newFormId, form.content.items, [], true);
        fieldSetting.value.fieldMapping = {};
        fieldSetting.value.version = 0;
      }
    }

    updateFieldSetting();
  },
  { immediate: true }
);

// 暴露的属性和方法
// defineExpose<FormFieldListInstance>({ addField });
</script>
<style lang="scss" scoped>
.field-list {
  // border-radius: 6px;
  // border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}
</style>
