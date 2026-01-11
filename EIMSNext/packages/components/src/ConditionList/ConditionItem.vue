<template>
  <div class="cond-item">
    <div class="cond-detail">
      <template v-if="condType == ConditionType.Node">
        <NodeFieldList
          class="cond-field"
          v-model="field"
          :nodes="nodes!"
          :fieldBuildSetting="fieldBuildSetting"
          :field-def="modelValue.field"
          @change="changeField"
        ></NodeFieldList>
      </template>
      <template v-else>
        <FieldList
          class="cond-field"
          v-model="field"
          :formId="formId"
          :fieldLimit="fieldBuildSetting.fieldLimit"
          @change="changeField"
        ></FieldList>
      </template>

      <el-dropdown
        v-model="op"
        class="cond-op"
        size="default"
        trigger="click"
        @command="onOpChanged"
      >
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
      <ConditionValue
        v-model="value"
        :field-def="field"
        :nodes="nodes"
        :fieldBuildSetting="valueBuildSetting"
        :options="buildOptions(field.options)"
        @change="onInput"
      ></ConditionValue>
    </div>
  </div>
</template>
<script setup lang="ts">
import { FieldType } from "@eimsnext/models";
import { ConditionType, ConditionValueType, IConditionList, dataOperators } from "./type";
import { useLocale } from "element-plus";
import { ConditionFieldType, IFieldBuildSetting, INodeForm, getConditionFieldType } from "@/NodeFieldList/type";
import { IFormFieldDef } from "@/FieldList/type";
import { IListItem } from "@/list/type";
import { computed, ref, toRef } from "vue";

const { t } = useLocale();

defineOptions({
  name: "ConditionItem",
});

const props = defineProps<{
  modelValue: IConditionList;
  formId: string;
  condType: ConditionType;
  fieldBuildSetting: IFieldBuildSetting;
  valueBuildSetting: IFieldBuildSetting;
  nodes?: INodeForm[];
}>();

const field = ref<IFormFieldDef>(
  props.modelValue.field ?? { formId: props.formId, field: "", label: "", type: FieldType.None }
);
const op = toRef(props.modelValue.op ?? "empty");
const value = ref(props.modelValue.value ?? { type: ConditionValueType.Custom, value: null });

const fieldType = ref<FieldType>(field.value?.type ?? FieldType.Input);

const dataType = computed(() => {
  return field.value.field ? getConditionFieldType(fieldType.value) : ConditionFieldType.Other;
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
  let newDataType = item.field ? getConditionFieldType(item.type) : ConditionFieldType.None;

  if (dataType.value != newDataType) {
    value.value.value = null;
    value.value.type = ConditionValueType.Custom;
    value.value.fieldValue = undefined;

    if (dataOperators[newDataType].indexOf(op.value) == -1)
      op.value = dataOperators[newDataType][0];

    fieldType.value = item.type;
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
const buildOptions = (options: any): IListItem[] => {
  if (!options) return [];
  
  let result: IListItem[] = [];
  
  try {
    // 1. 直接处理options为数组的情况
    if (Array.isArray(options)) {
      result = options.map((opt: any) => ({
        id: opt.value || opt.id,
        label: opt.label
      }));
    }
    // 2. 处理options为对象，且包含items字段的情况（这是我们从layout中提取的选项）
    else if (options.items && Array.isArray(options.items)) {
      result = options.items.map((opt: any) => ({
        id: opt.value || opt.id,
        label: opt.label
      }));
    }
    // 3. 处理options为对象，且直接包含options数组的情况
    else if (Array.isArray(options.options)) {
      result = options.options.map((opt: any) => ({
        id: opt.value || opt.id,
        label: opt.label
      }));
    }
    // 4. 处理options为对象，且options字段为字符串的情况
    else if (typeof options.options === 'string') {
      try {
        const parsedOptions = JSON.parse(options.options);
        if (Array.isArray(parsedOptions)) {
          result = parsedOptions.map((opt: any) => ({
            id: opt.value || opt.id,
            label: opt.label
          }));
        }
      } catch (e) {
        console.error('Failed to parse options string:', e);
      }
    }
    // 5. 处理options为对象，且包含layout字段的情况（直接从表单content.layout获取）
    else if (options.layout) {
      let layout = typeof options.layout === 'string' ? JSON.parse(options.layout) : options.layout;
      if (Array.isArray(layout)) {
        // 查找radio或checkbox类型的配置
        const fieldConfig = layout.find((item: any) => 
          item.type === 'radio' || item.type === 'checkbox'
        );
        if (fieldConfig && fieldConfig.options) {
          let fieldOptions = fieldConfig.options;
          if (typeof fieldOptions === 'string') {
            try {
              fieldOptions = JSON.parse(fieldOptions);
            } catch (e) {
              console.error('Failed to parse field options:', e);
            }
          }
          if (Array.isArray(fieldOptions)) {
            result = fieldOptions.map((opt: any) => ({
              id: opt.value || opt.id,
              label: opt.label
            }));
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to build options:', error);
  }
  
  return result;
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
