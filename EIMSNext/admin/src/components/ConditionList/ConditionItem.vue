<template>
  <div class="cond-item">
    <div class="cond-detail">
      <template v-if="condType == ConditionType.Node">
        <NodeFieldList class="cond-field" v-model="field" :nodes="nodes!" :match-type="false"
          :field-def="modelValue.field" :fieldBuildRule="fieldBuildRule" @change="changeField"></NodeFieldList>
      </template>
      <template v-else>
        <FieldList class="cond-field" v-model="field" :formId="formId" @change="changeField"></FieldList>
      </template>

      <el-dropdown v-model="op" class="cond-op" size="default" trigger="click" @command="onOpChanged">
        <span style="display: flex; align-items: center">
          {{ opLabel }}
          <et-icon icon="el-icon-arrow-down"></et-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <template v-for="item in dataOperators[dataType]" :key="item">
              <el-dropdown-item :command="item">{{ opLabels[item] }}</el-dropdown-item>
            </template>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <div class="flex-1"></div>
      <div><et-icon icon="el-icon-delete" class="pointer" @click="onRemove"></et-icon></div>
    </div>
    <div v-if="op != 'empty' && op != 'notempty'" class="cond-detail mt-[10px]">
      <ConditionValue v-model="value" :field-def="modelValue.field" :nodes="nodes" :fieldBuildRule="fieldBuildRule"
        @change="onInput"></ConditionValue>
    </div>
  </div>
</template>
<script setup lang="ts">
import { FieldType } from "@eimsnext/models";
import {
  ConditionType,
  ConditionValueType,
  IConditionList,
  dataOperators,
} from "./type";
import ConditionValue from "./ConditionValue.vue";
import FieldList from "../FieldList/index.vue";

import { useLocale } from "element-plus";
import { IFormFieldDef } from "@/components/FieldList/type";
import { ConditionFieldType, FieldBuildRule, INodeForm, getConditionFieldType } from "../FlowDesigner/components/NodeFieldList/type";
import NodeFieldList from "../FlowDesigner/components/NodeFieldList/index.vue";
const { t } = useLocale();

defineOptions({
  name: "ConditionItem",
});

const props = defineProps<{
  formId: string;
  modelValue: IConditionList;
  nodes?: INodeForm[];
  condType: ConditionType;
  fieldBuildRule?: FieldBuildRule;
}>();

const field = ref<IFormFieldDef>(
  props.modelValue.field ?? { formId: props.formId, field: "", label: "", type: FieldType.None }
);
const op = toRef(props.modelValue.op ?? "empty");
const value = ref(props.modelValue.value ?? { type: ConditionValueType.Custom, value: null });

const fieldType = ref<FieldType>(field.value?.type ?? FieldType.Input);

const dataType = computed(() => {
  return field.value.field ? getConditionFieldType(fieldType.value) : ConditionFieldType.Other
});

const emit = defineEmits(["update:modelValue", "change", "remove"]);

const buildOpLabels = () => {
  let p: Record<string, string> = {};

  ["eq", "ne", "in", "nin", "empty", "notempty", "gt", "gte", "lt", "lte"].forEach((o) => {
    p[o] = t("condition.op." + o);
  });
  return p;
};
const opLabels = ref(buildOpLabels());
const opLabel = computed(() => {
  return opLabels.value[op.value];
});

const changeField = (item: IFormFieldDef) => {
  field.value = item;
  let newDataType = item.field ? getConditionFieldType(item.type) : ConditionFieldType.None

  if (dataType.value != newDataType) {
    value.value.value = null;
    value.value.type = ConditionValueType.Custom;
    value.value.fieldValue = undefined

    if (dataOperators[newDataType].indexOf(op.value) == -1)
      op.value = dataOperators[newDataType][0]

    fieldType.value = item.type
  }

  emitChange();
};
const onOpChanged = (val: any) => {
  op.value = val;
  emitChange();
};

const onInput = () => {
  emitChange();
};
const emitChange = () => {
  let newModel = { id: props.modelValue.id, field: field.value, op: op.value, value: value.value };
  emit("update:modelValue", newModel);
  emit("change", newModel);
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
