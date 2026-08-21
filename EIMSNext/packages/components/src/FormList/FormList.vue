<template>
  <div class="form-list">
    <!-- 列表项 -->
    <ul class="form-list-wrapper">
      <li
        v-for="item in formList"
        :key="item.id"
        class="list-item"
        :class="{ active: item.id == modelValue?.id }"
      >
        <slot :item="item">
          <div class="item-wrapper clickable" @click.stop="itemClick(item)">
            <div class="item-content">
              <et-icon
                :icon="item.icon || 'icon-formdefault'"
                :color="item.iconColor || '#1296db'"
                class="item-icon"
              ></et-icon>
              <div class="item-label">
                {{ item.label }}
              </div>
            </div>
          </div>
        </slot>
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
import "./style/index.scss";
import { useAppStore, useFormStore } from "@eimsnext/store";
import { IFormItem, buildFormDefListItems, buildFormListItems } from "@/FormSelect/type";
import { ref, watch } from "vue";

defineOptions({
  name: "FormList",
});
const props = withDefaults(
  defineProps<{
    modelValue: IFormItem;
    appId: string;
    itemClass?: string;
    sourceScope?: "currentApp" | "crossApp";
    targetAppId?: string;
  }>(),
  {
    itemClass: "",
  },
);

const appStore = useAppStore();
const formStore = useFormStore();
const formList = ref<IFormItem[]>([]);

async function loadForms() {
  if (props.sourceScope === "crossApp") {
    const forms = await formStore.loadFormsIncludeCross(props.targetAppId || props.appId);
    formList.value = buildFormDefListItems(forms);
    return;
  }

  const app = await appStore.get(props.appId);
  formList.value = buildFormListItems(app!);
}

watch(
  [() => props.appId, () => props.sourceScope, () => props.targetAppId],
  () => {
    loadForms();
  },
  { immediate: true },
);

const emit = defineEmits(["update:modelValue", "itemClick"]);

const itemClick = (item: IFormItem) => {
  emit("update:modelValue", item);
  emit("itemClick", item);
};
</script>

<style scoped>
.item-icon {
  padding-right: var(--et-space-5);
}
</style>
