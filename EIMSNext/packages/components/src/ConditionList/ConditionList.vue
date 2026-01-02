<template>
  <div class="cond-list">
    <div v-if="showTitle" class="cond-list-title">
      <div v class="cond-list-label">
        <div>
          <!-- <span v-if="groupLevel == 1">条件组，</span> -->
          {{ t("comp.meetCondition") }}
        </div>
        <el-select v-model="list.rel" size="small" style="width: 65px; margin-left: 5px; margin-right: 5px">
          <el-option :label="t('comp.rel_And')" value="and" />
          <el-option :label="t('comp.rel_Or')" value="or" />
        </el-select>
        <div>{{ t("comp.conditions") }}</div>
      </div>
      <div v-if="groupLevel > 1">
        <et-icon icon="el-icon-delete" class="pointer" @click="onRemove"></et-icon>
      </div>
    </div>
    <div class="btn-add-item">
      <el-link type="primary" underline="never" class="add-item" @click="addItem">
        <et-icon icon="el-icon-circle-plus" size="1.2em" style="padding-right: 5px"></et-icon>
        {{ t("computed.addCondition") }}
      </el-link>
      <el-link v-if="groupLevel < maxLevel" type="primary" underline="never" class="add-item" @click="addGroup">
        <et-icon icon="el-icon-circle-plus" size="1.2em" style="padding-right: 5px"></et-icon>
        {{ t("computed.addGroup") }}
      </el-link>
      <div class="flex-1"></div>
    </div>
    <div class="cond-item-wrapper">
      <template v-for="(item, idx) in list.items" :key="item.id">
        <template v-if="item.isGroup">
          <ConditionList :modelValue="item" :formId="formId" :nodes="nodes" :condType="condType" :maxLevel="maxLevel"
            :fieldBuildSetting="fieldBuildSettingRef" :valueBuildSetting="valueBuildSettingRef" @change="onInput"
            @remove="removeGroup(idx)"></ConditionList>
        </template>
        <template v-else>
          <ConditionItem :modelValue="item" :formId="formId" :nodes="nodes" :condType="condType"
            :fieldBuildSetting="fieldBuildSettingRef" :valueBuildSetting="valueBuildSettingRef" @change="onInput"
            @remove="removeItem(idx)"></ConditionItem>
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
import { FieldBuildRule, IFieldBuildSetting, INodeForm } from "@/NodeFieldList/type";
import { ref, toRef, watch } from "vue";

const { t } = useLocale();

defineOptions({
  name: "ConditionList",
});

const props = withDefaults(
  defineProps<{
    formId: string;
    modelValue: IConditionList;
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
    maxLevel: 3
  }
);

const fieldBuildSettingRef = toRef(props.fieldBuildSetting ?? { version: 0, rule: FieldBuildRule.All, matchType: false })
const valueBuildSettingRef = toRef(props.fieldBuildSetting ?? { version: 0, rule: FieldBuildRule.All, matchType: true })
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
  { immediate: true }
);
</script>
<style lang="scss" scoped>
.cond-list {
  border-radius: 6px;
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;

  .cond-list-title {
    height: 36px;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 17px 0 15px;

    .cond-list-label {
      color: #333;
      font-size: 14px;
      display: flex;
    }
  }

  .cond-item-wrapper {
    padding: 0 10px 10px 10px;
  }

  .btn-add-item {
    margin: 10px;
    display: flex;
    align-items: center;

    .add-item {
      margin-left: 15px;
    }
  }
}
</style>
