<template>
  <div class="et-field-select-list">
    <div class="field-list-header">
      <span class="field-header">全选</span>
      <div class="field-check-col">
        <el-checkbox :model-value="allChecked" :indeterminate="indeterminate" @change="toggleAll" />
      </div>
    </div>

    <div class="field-list-content">
      <template v-for="item in fieldItems" :key="item.id">
        <div class="field-item" :class="{ selected: isSelected(item.id) }" @click="toggleField(item.id)">
          <div class="field-item-text" :style="{ paddingLeft: `${(item.level || 0) * 16}px` }">
            <span>{{ item.label }}</span>
          </div>
          <div class="field-check-col">
            <el-checkbox :model-value="isSelected(item.id)" @click.stop="" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { FieldDef, FieldType } from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";

defineOptions({
  name: "FieldSelectList",
});

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    formId: string;
    showSubFields?: boolean;
  }>(),
  {
    modelValue: () => [],
    showSubFields: true,
  },
);

const emit = defineEmits(["update:modelValue", "change"]);

interface IFieldItem {
  id: string;
  label: string;
  type: FieldType;
  level: number;
}

const formStore = useFormStore();
const fieldItems = ref<IFieldItem[]>([]);

const buildFieldItems = (
  fields: FieldDef[],
  level: number = 0,
): IFieldItem[] => {
  const items: IFieldItem[] = [];
  fields.forEach((field) => {
    if (field.type === FieldType.TableForm && field.columns) {
      items.push({
        id: field.field,
        label: field.title,
        type: field.type,
        level,
      });
      if (props.showSubFields) {
        field.columns.forEach((sub) => {
          items.push({
            id: `${field.field}.${sub.field}`,
            label: sub.title,
            type: sub.type,
            level: level + 1,
          });
        });
      }
    } else {
      items.push({
        id: field.field,
        label: field.title,
        type: field.type,
        level,
      });
    }
  });
  return items;
};

const isSelected = (fieldId: string): boolean => {
  return props.modelValue.includes(fieldId);
};

const allChecked = computed(() => {
  return (
    fieldItems.value.length > 0 &&
    fieldItems.value.every((item) => props.modelValue.includes(item.id))
  );
});

const indeterminate = computed(() => {
  const selectedCount = fieldItems.value.filter((item) =>
    props.modelValue.includes(item.id),
  ).length;
  return selectedCount > 0 && selectedCount < fieldItems.value.length;
});

const toggleField = (fieldId: string) => {
  let newFields: string[];
  if (props.modelValue.includes(fieldId)) {
    newFields = props.modelValue.filter((f) => f !== fieldId);
  } else {
    newFields = [...props.modelValue, fieldId];
  }
  emit("update:modelValue", newFields);
  emit("change", newFields);
};

const toggleAll = (checked: any) => {
  if (checked) {
    emit(
      "update:modelValue",
      fieldItems.value.map((item) => item.id),
    );
  } else {
    emit("update:modelValue", []);
  }
  emit("change", props.modelValue);
};

onMounted(async () => {
  const form = await formStore.get(props.formId);
  if (form?.content?.items) {
    fieldItems.value = buildFieldItems(form.content.items);
  }
});
</script>

<style lang="scss" scoped>
.et-field-select-list {
  border: 1px solid var(--et-border-color);
  border-radius: 4px;

  .field-list-header {
    display: flex;
    align-items: center;
    padding: var(--et-space-3) var(--et-space-10);
    background: var(--et-bg-page);
    border-bottom: 1px solid var(--et-border-color);
    font-weight: 500;

    .field-header {
      flex: 1;
    }

    .field-check-col {
      width: 40px;
      display: flex;
      justify-content: center;
    }
  }

  .field-list-content {
    max-height: 300px;
    overflow-y: auto;

    .field-item {
      display: flex;
      align-items: center;
      padding: var(--et-space-3) var(--et-space-10);
      border-bottom: 1px solid var(--et-border-color-light);
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: var(--et-bg-page);
      }

      &.selected {
        background: var(--et-color-primary-light-9);

        &:hover {
          background: var(--et-bg-page);
        }
      }

      .field-item-text {
        flex: 1;
      }

      .field-check-col {
        width: 40px;
        display: flex;
        justify-content: center;
      }
    }
  }
}
</style>
