<template>
  <div class="cond-item">
    <div class="cond-detail">
      <div class="flex-1">{{ modelValue.field.label }}</div>
      <div>
        <el-radio-group v-model="sort" size="default" class="mr-[5px]" @change="onSortChanged">
          <el-radio-button :label="t('comp.orderby_Asc')" :value="SortDirection.Asc" />
          <el-radio-button :label="t('comp.orderby_Desc')" :value="SortDirection.Desc" />
        </el-radio-group>
      </div>
      <div><et-icon icon="el-icon-delete" class="pointer" @click="onRemove"></et-icon></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { IFieldSortItem } from "./type";
import { SortDirection } from "@eimsnext/services";

import { useLocale } from "element-plus";
const { t } = useLocale();

defineOptions({
  name: "FieldSortItem",
});

const props = defineProps<{
  // formId: string;
  modelValue: IFieldSortItem;
}>();

const sort = ref(props.modelValue.sort);

const emit = defineEmits(["update:modelValue", "change", "remove"]);

const onSortChanged = () => {
  props.modelValue.sort = sort.value;
  emitChange();
};
const emitChange = () => {
  emit("update:modelValue", props.modelValue);
  emit("change", props.modelValue);
};
const onRemove = () => {
  emit("remove", props.modelValue);
};
</script>
<style lang="scss" scoped>
.cond-item {
  border: 1px dashed #eee;
  background: #fcfcfc;
  padding: 10px;
  border-radius: 3px;

  .cond-detail {
    display: flex;
    align-items: center;

    .cond-field {
      margin-right: 5px;
    }

    .cond-op {
      min-width: 90px;
    }
  }
}
</style>
