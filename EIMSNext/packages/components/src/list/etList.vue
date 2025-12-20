<template>
  <div class="et-list">
    <!-- 全选控制 -->
    <div v-if="selectable && multiple" class="list-header">
      <div class="item-header">{{ headerText }}</div>
      <el-checkbox v-model="allSelected"> </el-checkbox>
    </div>

    <!-- 列表项 -->
    <ul class="list-content-wrapper">
      <li v-for="item in data" :key="item.id" class="list-item">
        <slot :item="item">
          <div class="content-wrapper" @click.stop="itemClick(item)" :class="{ clickable: !selectable }">
            <div class="item-content">
              <et-icon v-if="item.icon" :icon="item.icon" :color="item.color" style="padding-right: 5px"></et-icon>
              <div class="item-label">
                {{ item.label }}
              </div>
            </div>
            <template v-if="selectable">
              <el-checkbox v-if="multiple" :model-value="modelValue && modelValue.includes(item.id)"
                @change="(val: boolean) => handleItemCheck(item, val)">
              </el-checkbox>
              <el-radio v-if="!multiple" v-model="singleItemId" :value="item.id"
                @change="(val: string) => handleRadioCheck(item, val)"></el-radio></template>
          </div>
        </slot>
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
import "./style/index.less";
import { computed, ref } from "vue";
import { IListItem } from "./type";

defineOptions({
  name: "EtList",
});
const props = withDefaults(
  defineProps<{
    modelValue: string[];
    data: IListItem[];
    selectable?: boolean;
    itemClass?: string;
    multiple?: boolean;
  }>(),
  {
    selectable: false,
    itemClass: "",
    multiple: true
  }
);

const oldSingleItemId = ref<string>()
const oldSingleItem = ref<IListItem>()
const singleItemId = ref<string>()
if (!props.multiple && props.modelValue?.length > 0) {
  singleItemId.value = props.modelValue[0]
  oldSingleItemId.value = singleItemId.value
  oldSingleItem.value = props.data.find(x => x.id == oldSingleItemId.value)
}

const headerText = computed(() => {
  let selCnt = 0;
  if (props.modelValue) selCnt = props.modelValue.length;

  return `已选 ${selCnt}/${props.data.length}`;
});

const allSelected = computed({
  get: () =>
    props.modelValue &&
    props.modelValue.length > 0 &&
    props.data.every((item) => props.modelValue.includes(item.id)),
  set: (val) => {
    const newValue = val ? props.data.map((i) => i.id) : [];
    emit("update:modelValue", newValue);

    emit("allCheck", val);
  },
});

const emit = defineEmits([
  "update:modelValue",
  "itemCheck",
  "allCheck",
  "itemClick",
]);

const handleItemCheck = (item: IListItem, checked: boolean) => {
  if (props.multiple) {
    let newValue: string[] = [item.id];

    if (props.modelValue) {
      newValue = checked
        ? [...props.modelValue, item.id]
        : props.modelValue.filter((itemId) => itemId !== item.id);
    }

    emit("update:modelValue", newValue);
    emit("itemCheck", item, checked);
  }
};

const handleRadioCheck = (item: IListItem, val: string) => {
  if (!props.multiple) {
    if (singleItemId.value) {
      let newValue: string[] = [singleItemId.value];

      emit("update:modelValue", newValue);
      if (oldSingleItem.value) {
        emit("itemCheck", oldSingleItem.value, false);
      }
      emit("itemCheck", item, true);
      oldSingleItem.value = item;
      oldSingleItemId.value = val
    }
    else {
      emit("update:modelValue", []);
      if (oldSingleItem.value) {
        emit("itemCheck", oldSingleItem.value, false);
        oldSingleItem.value = undefined;
        oldSingleItemId.value = ""
      }
    }
  }
};

const itemClick = (item: IListItem) => {
  if (!props.selectable) emit("itemClick", item);
};
</script>
