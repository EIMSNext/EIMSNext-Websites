<template>
  <div class="quick-filter-viewer">
    <div v-if="setting.showTitle" class="quick-filter-title">{{ setting.name }}</div>
    <el-select
      v-model="selectedId"
      clearable
      class="quick-filter-select"
      :placeholder="t('common.pleaseSelect')"
      @change="emitChange"
    >
      <el-option v-for="option in setting.options" :key="option.id" :label="option.name" :value="option.id" />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { cloneDeep } from "lodash-es";
import { useI18n } from "vue-i18n";
import { DashboardQuickFilterOption, DashboardQuickFilterSetting } from "@eimsnext/models";
import { resolveQuickFilterConditionValue } from "./type";

const props = withDefaults(defineProps<{ itemId: string; setting: DashboardQuickFilterSetting; isPublic?: boolean }>(), { isPublic: false });
const emit = defineEmits<{ change: [payload: { itemId: string; option?: DashboardQuickFilterOption }] }>();
const { t } = useI18n();
const selectedId = ref<string>();

watch(() => props.setting.options, (options) => {
  if (selectedId.value && !options.some((option) => option.id === selectedId.value)) selectedId.value = undefined;
}, { deep: true });

let changeVersion = 0;
const emitChange = async () => {
  const currentVersion = ++changeVersion;
  const option = props.setting.options.find((item) => item.id === selectedId.value);
  const resolvedOption = option
    ? {
        ...cloneDeep(option),
        conditions: await Promise.all(option.conditions.map(async (condition) => ({
          ...cloneDeep(condition),
          defaultValue: await resolveQuickFilterConditionValue(condition, props.isPublic),
        }))),
      }
    : undefined;
  if (currentVersion !== changeVersion) return;
  emit("change", {
    itemId: props.itemId,
    option: resolvedOption,
  });
};
</script>

<style scoped lang="scss">
.quick-filter-viewer { display: flex; flex-direction: column; gap: var(--et-space-8); width: 100%; height: 100%; padding: 18px 20px; box-sizing: border-box; }
.quick-filter-title { color: var(--et-text-primary); font-size: var(--et-font-size-14); font-weight: 700; }
.quick-filter-select { width: 100%; }
</style>
