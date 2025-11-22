<template>
  <div class="field-list">
    <el-dropdown v-if="!showAll" :hide-on-click="false" trigger="click" popper-class="data-triggers"
      @command="addField">
      <el-button class="btn-add-trigger">
        {{ "+ " + t("选择字段") }}
      </el-button>
      <template #dropdown>
        <el-dropdown-menu class="trigger-header">
          <el-dropdown-item v-for="field in allFields" class="add-trigger"
            :disabled="!!selectedFields.items.find((x) => x.field == field.field)"
            :class="{ notAllow: selectedFields.items.find((x) => x.field == field.field) }" :command="field">
            {{ field.field.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <template v-for="(item, idx) in selectedFields.items" :key="idx">
      <FormFieldItem :modelValue="item" :nodes="nodes" :removable="!showAll" @change="onInput" @remove="onRemove">
      </FormFieldItem>
    </template>
  </div>
</template>
<script setup lang="ts">
import { FormDef, FieldDef, FieldType } from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import FormFieldItem from "./FormFieldItem.vue";
import { useLocale } from "element-plus";
import { IFormFieldList, IFormFieldItem, buildFormFieldList } from "./type";
import { INodeForm } from "../NodeFieldList/type";
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
  }>(),
  {}
);

const allFields = ref<IFormFieldItem[]>([]);
const selectedFields = ref<IFormFieldList>(props.modelValue);

const formStore = useFormStore();
const formDef = ref<FormDef>();

const emit = defineEmits(["update:modelValue", "change"]);

const addField = (fieldItem: IFormFieldItem) => {
  selectedFields.value.items.push(fieldItem);
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
    if (item) {
      item.field = fieldItem.field;
      item.value = fieldItem.value;
    }
  }
  emitChange();
};

const emitChange = () => {
  emit("update:modelValue", selectedFields);
  emit("change", selectedFields);
};

watch(
  [() => props.formId, () => props.modelValue],
  async ([newFormId, newModel], [oldFormId, oldModel]) => {
    // console.log("formfieldlist watch", newFormId, oldFormId, newModel, oldModel);
    if (newFormId && newFormId != oldFormId) {
      let form = await formStore.get(newFormId);
      if (form && form.content && form.content.items) {
        allFields.value = buildFormFieldList(newFormId, form.content.items, [], true);
      }
    }
    if (newModel != oldModel) {
      selectedFields.value = newModel;
    }
  },
  { immediate: true }
);
</script>
<style lang="scss" scoped>
.field-list {
  // border-radius: 6px;
  // border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}
</style>
