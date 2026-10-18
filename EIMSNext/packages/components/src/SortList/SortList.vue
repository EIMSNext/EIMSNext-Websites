<template>
  <div class="field-list">
    <el-dropdown v-if="editable" :hide-on-click="false" trigger="click" popper-class="data-triggers"
      @command="addField">
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
    <template v-for="(item, idx) in modelValue.items" :key="item.field.field">
      <SortItem :modelValue="item" @editable="editable" @change="onChange" @remove="onRemove"></SortItem>
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useLocale } from "element-plus";
import { buildSortListItems, ISortField, ISortItem, ISortList } from "./type";
import { SortDirection } from "@eimsnext/services";
import { IListItem } from "@/list/type";

const { t } = useLocale();

defineOptions({
  name: "SortList",
});

const props = withDefaults(
  defineProps<{
    modelValue: ISortList;
    sortFields: ISortField[];
    editable?: boolean;
    multiple?: boolean;
  }>(),
  {
    editable: true,
    multiple: true
  }
);

const allFields = ref<IListItem[]>([]);
const disabledFieldIds = computed(() => {
  return props.modelValue.items.map(item => item.field.field);
});

const emit = defineEmits(["update:modelValue", "change"]);

const addField = (field: ISortField) => {
  props.modelValue.items.push({ field: field, sort: SortDirection.Asc });
};

const onRemove = (sortItem: ISortItem) => {
  if (sortItem && props.modelValue.items) {
    props.modelValue.items = props.modelValue.items.filter(x => x.field.field != sortItem.field.field)
  }

  emitChange();
};

const onChange = (sortItem: ISortItem) => {
  if (props.multiple) {
    if (sortItem && props.modelValue.items) {
      let item = props.modelValue.items.find((x) => x.field.field == sortItem.field.field);
      if (item) {
        item.sort = sortItem.sort;
      }
    }
  }
  else {
    if (sortItem && props.modelValue.items) {
      const newSortItems = props.modelValue.items.map((item) => ({
        ...item,
        sort: item.field.field === sortItem.field.field ? sortItem.sort : SortDirection.Unset
      }));
      props.modelValue.items = newSortItems
    }
  }

  emitChange();
};

const emitChange = () => {
  emit("update:modelValue", props.modelValue);
  emit("change", props.modelValue);
};

watch(
  [() => props.sortFields],
  () => {
    if (props.editable)
      allFields.value = buildSortListItems(props.sortFields);
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
