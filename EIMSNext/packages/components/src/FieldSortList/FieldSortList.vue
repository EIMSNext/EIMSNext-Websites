<template>
  <div class="field-list">
    <el-dropdown :hide-on-click="false" trigger="click" popper-class="data-triggers" @command="addField">
      <el-button class="btn-add-trigger">
        {{ "+ " + t("comp.addSortRule") }}
      </el-button>
      <template #dropdown>
        <el-dropdown-menu class="trigger-header">
          <el-dropdown-item v-for="field in allFields" class="add-trigger"
            :disabled="disabledFieldIds.includes(field.id)" :class="{ notAllow: disabledFieldIds.includes(field.id) }"
            :command="field.data">
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
import { computed, ref, toRef, watch } from "vue";
import { useFormStore } from "@eimsnext/store";
import { useLocale } from "element-plus";
import { IFieldSortItem, IFieldSortList } from "./type";
import { IFormFieldDef, buildFieldListItems } from "../FieldList/type";
import { SortDirection } from "@eimsnext/services";
import { IListItem } from "@/list/type";
import { IFieldPerm } from "@eimsnext/models";
const { t } = useLocale();

defineOptions({
  name: "FieldSortList",
});

const props = withDefaults(
  defineProps<{
    modelValue: IFieldSortList;
    formId: string;
    fieldPerms?: IFieldPerm[];
  }>(),
  {}
);

const formStore = useFormStore();

const selectedFields = toRef<IFieldSortList>(props.modelValue);
const allFields = ref<IListItem[]>([]);
const disabledFieldIds = computed(() => {
  return selectedFields.value.items.map(item => item.field.field);
});

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
  [() => props.formId],
  async ([newFormId], [oldFormId]) => {
    if (newFormId && newFormId != oldFormId) {
      let form = await formStore.get(newFormId);
      if (form && form.content && form.content.items) {
        allFields.value = buildFieldListItems(newFormId, form.content.items, form.usingWorkflow);
      }
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
