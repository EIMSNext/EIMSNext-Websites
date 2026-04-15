<template>
  <div class="cond-list">
    <div v-if="showTitle" class="cond-list-title">
      <div v class="cond-list-label">
        <div>
          <!-- <span v-if="groupLevel == 1">条件组，</span> -->
          {{ t("comp.meetCondition") }}
        </div>
        <el-select v-model="list.rel" size="small" class="relation-select">
          <el-option :label="t('comp.rel_And')" value="and" />
          <el-option :label="t('comp.rel_Or')" value="or" />
        </el-select>
        <div>{{ t("comp.conditions") }}</div>
      </div>
      <!-- <div v-if="groupLevel > 1"> -->
      <et-icon icon="el-delete" class="pointer" @click="onRemove"></et-icon>
      <!-- </div> -->
    </div>
    <div class="btn-add-item">
      <el-link
        type="primary"
        underline="never"
        class="add-item"
        @click="addItem"
      >
        <et-icon icon="el-circle-plus" size="1.2em" class="add-icon"></et-icon>
        {{ t("computed.addCondition") }}
      </el-link>
      <el-link
        v-if="groupLevel < maxLevel"
        type="primary"
        underline="never"
        class="add-item"
        @click="addGroup"
      >
        <et-icon icon="el-circle-plus" size="1.2em" class="add-icon"></et-icon>
        {{ t("computed.addGroup") }}
      </el-link>
      <div class="flex-1"></div>
    </div>
    <div class="cond-item-wrapper">
      <template v-for="(item, idx) in list.items" :key="item.id">
        <template v-if="item.isGroup">
          <ConditionList
            :modelValue="item"
            :formId="formId"
            :nodes="nodes"
            :condType="condType"
            :maxLevel="maxLevel"
            :fieldBuildSetting="fieldBuildSettingRef"
            :valueBuildSetting="valueBuildSettingRef"
            @change="onInput"
            @remove="removeGroup(idx)"
          ></ConditionList>
        </template>
        <template v-else>
          <ConditionItem
            :modelValue="item"
            :formId="formId"
            :nodes="nodes"
            :condType="condType"
            :fieldBuildSetting="fieldBuildSettingRef"
            :valueBuildSetting="valueBuildSettingRef"
            @change="onInput"
            @remove="removeItem(idx)"
          ></ConditionItem>
        </template>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { FieldDef, FieldType } from "@eimsnext/models";
import { useLocale } from "element-plus";
import { ConditionType, ConditionValueType, IConditionList } from "./type";
import { uniqueId } from "@eimsnext/utils";
import {
  FieldBuildRule,
  IFieldBuildSetting,
  INodeForm,
} from "@/NodeFieldList/type";
import { ref, toRef, watch } from "vue";

const { t } = useLocale();

defineOptions({
  name: "ConditionList",
});

const props = withDefaults(
  defineProps<{
    modelValue: IConditionList;
    formId: string;
    showTitle?: boolean;
    nodes?: INodeForm[];
    condType?: ConditionType;
    maxLevel?: number;
    fieldBuildSetting?: IFieldBuildSetting;
    valueBuildSetting?: IFieldBuildSetting;
  }>(),
  {
    showTitle: true,
    condType: ConditionType.Form,
    maxLevel: 3,
  },
);

const fieldBuildSettingRef = toRef(
  props.fieldBuildSetting ?? {
    version: 0,
    rule: FieldBuildRule.All,
    matchType: false,
  },
);
const valueBuildSettingRef = toRef(
  props.fieldBuildSetting ?? {
    version: 0,
    rule: FieldBuildRule.All,
    matchType: true,
  },
);
const list = toRef(props.modelValue);
const groupLevel = ref(1);

const addItem = () => {
  if (!list.value.items) list.value.items = [];

  list.value.items.push({
    id: uniqueId(),
    field: { formId: props.formId, field: "", label: "", type: FieldType.None },
    op: "empty",
    value: { type: ConditionValueType.Custom, value: null },
  });
};
const removeItem = (idx: number) => {
  list.value.items!.splice(idx, 1);
  onInput();
};
const addGroup = () => {
  if (!list.value.items) list.value.items = [];

  list.value.items.push({
    id: uniqueId(),
    rel: "and",
    items: [],
    isGroup: true,
    groupLevel: groupLevel.value + 1,
  });
};
const removeGroup = (idx: number) => {
  list.value.items!.splice(idx, 1);
  onInput();
};

const emit = defineEmits(["update:modelValue", "change", "remove"]);
const onInput = (condItem?: IConditionList) => {
  if (condItem && list.value.items) {
    let item = list.value.items.find((x) => x.id == condItem.id);
    if (item) {
      item.field = condItem.field;
      item.op = condItem.op;
      item.value = condItem.value;
    }
  }

  emit("update:modelValue", list.value);
  emit("change", list.value);
};
const onRemove = () => {
  emit("remove", props.modelValue);
};
watch(
  () => props.modelValue,
  (newModel) => {
    list.value = newModel;
    groupLevel.value = newModel.groupLevel ?? 1;
  },
  { immediate: true },
);
</script>
<style lang="scss" scoped>
.cond-list {
  border-radius: var(--et-radius-6);
  border: 1px solid var(--et-border-color);
  display: flex;
  flex-direction: column;

  .cond-list-title {
    height: var(--et-size-36);
    background: var(--et-bg-muted);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--et-space-17) 0 var(--et-space-15);

    .cond-list-label {
      color: var(--et-text-primary);
      font-size: var(--et-font-size-14);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  .cond-item-wrapper {
    padding: 0 var(--et-space-10) var(--et-space-10) var(--et-space-10);
  }

  .btn-add-item {
    margin: var(--et-space-10);
    display: flex;
    align-items: center;

    .add-item {
      margin-left: var(--et-space-15);
    }
  }
}

.relation-select {
  width: var(--et-size-65);
  margin-left: var(--et-space-5);
  margin-right: var(--et-space-5);
}

.add-icon {
  padding-right: var(--et-space-5);
}
</style>
