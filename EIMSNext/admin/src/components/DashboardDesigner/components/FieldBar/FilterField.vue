<template>
  <el-popover
    :visible="showFilter"
    :virtual-ref="filterBtnRef"
    :show-arrow="false"
    :offset="5"
    placement="bottom-end"
    width="500"
    :teleported="false"
    trigger="click"
    :destroy-on-close="true"
  >
    <DashFilter
      :model-value="condList"
      :formId="formId"
      @ok="setFilter"
      @cancel="showFilter = false"
    ></DashFilter>
  </el-popover>
  <div class="item dimension-item">
    <div @click="onFieldClick" class="item-text">
      <et-icon icon="el-filter" color="var(--et-text-on-primary)" class="field-icon"></et-icon>
      <span ref="filterBtnRef">设置过滤条件</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { IConditionList } from "@eimsnext/components";
import DashFilter from "../DashFilter.vue";
import { uniqueId } from "@eimsnext/utils";
import { cloneDeep } from "lodash-es";

defineOptions({
  name: "FilterField",
});

const props = defineProps<{
  formId: string;
  filter?: IConditionList;
}>();

const showFilter = ref(false);
const filterBtnRef = ref(null);
const condList = ref<IConditionList>({ id: uniqueId(), rel: "and", items: [] });
if (props.filter) condList.value = cloneDeep(props.filter);

const emit = defineEmits(["ok", "cancel"]);

const onFieldClick = () => {
  showFilter.value = true;
};
const setFilter = (filter: IConditionList) => {
  condList.value = filter;
  showFilter.value = false;
  emit("ok", cloneDeep(condList.value));
};
</script>
<style lang="scss" scoped>
.item {
  cursor: pointer !important;
  border-radius: var(--et-radius-20);
  padding: var(--et-space-4) var(--et-space-10) var(--et-space-4) var(--et-space-2);
  position: relative;
  height: var(--et-size-25);

  .field-icon {
    margin: 0 var(--et-space-5);
  }

  &:hover {
    .close-icon {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .close-icon {
    position: absolute;
    right: var(--et-space-6);
    top: var(--et-space-4);
    display: none;
    cursor: pointer;
    background-color: var(--et-bg-container);
    border-radius: var(--et-radius-round);
    width: var(--et-space-15);
    height: var(--et-space-15);
    line-height: var(--et-line-height-16);
    text-align: center;
  }

  .item-text {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: var(--et-line-height-16);
  }
}

.dimension-item {
  background-color: var(--et-color-primary-hover);
  color: var(--et-text-on-primary);
}
</style>
