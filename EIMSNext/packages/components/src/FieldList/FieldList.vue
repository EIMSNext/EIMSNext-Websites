<template>
  <el-select v-model="value" size="default" @change="onInput">
    <el-option v-for="item in fieldList" :key="item.id" :label="item.label" :value="item.id" />
  </el-select>
</template>

<script setup lang="ts">
import { useFormStore } from "@eimsnext/store";
import { IFormFieldDef, buildFieldListItems } from "./type";
import { ref, watch } from "vue";
import { IListItem } from "@/list/type";
import { IFieldLimit } from "@/NodeFieldList/type";

defineOptions({
  name: "FieldList",
});
const props = defineProps<{
  modelValue: IFormFieldDef;
  formId: string;
  fieldLimit?: IFieldLimit;
}>();

const formStore = useFormStore();
const fieldList = ref<IListItem[]>([]);

const value = ref(props.modelValue?.field);

const emit = defineEmits(["update:modelValue", "change"]);
const onInput = (val: string) => {
  let listItem = fieldList.value.find((x) => x.id == val)!;
  emit("update:modelValue", listItem.data);
  emit("change", listItem.data);
};

watch(
    () => props.formId,
    (newFormId, oldFormId) => {
      if (newFormId && newFormId != oldFormId) {
        formStore.get(newFormId).then((form) => {
          if (form?.content?.items) {
            let items = [...form.content.items];
            
            // 解析layout，提取选项数据
            if (form.content.layout) {
              try {
                const layout = JSON.parse(form.content.layout);
                if (Array.isArray(layout)) {
                  // 遍历layout中的每个字段配置
                  layout.forEach((layoutItem: any) => {
                    if (layoutItem.type && layoutItem.field && layoutItem.options) {
                      // 查找对应的items字段
                      const fieldItem = items.find((item) => item.field === layoutItem.field);
                      if (fieldItem) {
                        // 将选项数据直接存储在fieldItem.options中
                        fieldItem.options = layoutItem.options;
                      }
                    }
                  });
                }
              } catch (error) {
                console.error('Failed to parse layout:', error);
              }
            }
            
            fieldList.value = buildFieldListItems(newFormId, items, form.usingWorkflow, undefined, props.fieldLimit);
          }
        });
      }
    },
    { immediate: true }
  );
</script>
