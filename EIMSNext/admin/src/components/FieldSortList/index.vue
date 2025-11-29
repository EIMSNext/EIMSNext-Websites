<template>
  <div class="field-list">
    <el-dropdown :hide-on-click="false" trigger="click" popper-class="data-triggers" @command="addField">
      <el-button class="btn-add-trigger">
        {{ "+ " + t("添加排序规则") }}
      </el-button>
      <template #dropdown>
        <el-dropdown-menu class="trigger-header">
          <el-dropdown-item v-for="field in allFields" class="add-trigger"
            :disabled="!!selectedFields.items.find((x) => x.field.field == field.id)"
            :class="{ notAllow: selectedFields.items.find((x) => x.field.field == field.id) }" :command="field.data">
            {{ field.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <template v-for="(item, idx) in selectedFields.items" :key="item.field.field">
      <FieldSortItem :modelValue="item" @change="onChange" @remove="onRemove"></FieldSortItem>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { useFormStore } from "@eimsnext/store";
import { useLocale } from "element-plus";
import FieldSortItem from "./FieldSortItem.vue";
import { IFieldSortItem, IFieldSortList } from "./type";
import { IFormFieldDef, buildFieldListItems } from "../FieldList/type";
import { IListItem } from "@eimsnext/components";
import { SortDirection } from "@eimsnext/services";
const { t } = useLocale();

defineOptions({
  name: "FieldSortList",
});

const props = withDefaults(
  defineProps<{
    formId: string;
    modelValue: IFieldSortList;
  }>(),
  {}
);

const formStore = useFormStore();

const selectedFields = toRef<IFieldSortList>(props.modelValue);
const allFields = ref<IListItem[]>([]);

const emit = defineEmits(["update:modelValue", "change"]);

const addField = (field: IFormFieldDef) => {
  selectedFields.value.items.push({ field: field, sort: SortDirection.Asc });
};

const onRemove = (sortItem: IFieldSortItem) => {
  if (sortItem && selectedFields.value.items) {
    let index = selectedFields.value.items.findIndex((x) => x.field.field == sortItem.field.field);
    if (index > -1) {
      selectedFields.value.items.splice(index, 1);
    }
  }

  emitChange();
};

const onChange = (sortItem: IFieldSortItem) => {
  if (sortItem && selectedFields.value.items) {
    let item = selectedFields.value.items.find((x) => x.field.field == sortItem.field.field);
    if (item) {
      item.sort = sortItem.sort;
    }
  }
  emitChange();
};

const emitChange = () => {
  emit("update:modelValue", selectedFields.value);
  emit("change", selectedFields.value);
};

watch(
  [() => props.formId, () => props.modelValue],
  async ([newFormId, newModel], [oldFormId, oldModel]) => {
    if (newFormId && newFormId != oldFormId) {
      let form = await formStore.get(newFormId);
      if (form && form.content && form.content.items) {
        allFields.value = buildFieldListItems(newFormId, form.content.items, form.usingWorkflow);
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
