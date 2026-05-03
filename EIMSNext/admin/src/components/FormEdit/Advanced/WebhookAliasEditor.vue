<template>
  <div class="api-config-pane">
    <div class="webhook-alias-editor">
      <div class="alias-editor-header" style="padding:8px 12px; border-bottom:1px solid #ebeef5;">
        <span style="font-weight:600;">设置字段别名</span>
      </div>
      <div class="alias-editor-body" style="flex:1; padding:12px 0 0; overflow:auto;">
        <el-table :data="internalAliases" border style="width:100%">
          <el-table-column prop="name" label="字段名称" width="200" />
          <el-table-column prop="id" label="字段ID" min-width="300" />
          <el-table-column prop="type" label="字段类型" width="100" />
          <el-table-column label="字段别名" width="200">
            <template #default="scope">
              <el-input v-model="scope.row.alias" size="small" placeholder="请输入别名" />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="alias-editor-footer" style="border-top:1px solid #ebeef5; padding:12px; text-align:center;">
        <el-button @click="emitCancel">取消</el-button>
        <el-button type="primary" @click="emitSave">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue';

type FieldAliasRow = {
  name: string;
  id: string;
  type: string;
  alias?: string;
};

const props = defineProps<{ modelValue: FieldAliasRow[] }>();
const emit = defineEmits<{
  'update:modelValue': (val: FieldAliasRow[]) => void;
  'save': () => void;
  'cancel': () => void;
}>();

const internalAliases = ref<FieldAliasRow[]>([]);
watch(
  () => props.modelValue,
  (v) => {
    internalAliases.value = v ? [...v] : [];
  },
  { immediate: true }
);

watch(
  internalAliases,
  (v) => {
    emit('update:modelValue', v);
  },
  { deep: true }
);

const emitSave = () => emit('save');
const emitCancel = () => emit('cancel');
</script>

<style scoped>
.api-config-pane {
  background: var(--et-bg-page);
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;

  .webhook-alias-editor {
    background: var(--et-bg-container);
    border-radius: var(--et-radius-6);
    bottom: 0;
    left: 0;
    margin: var(--et-space-20) auto;
    position: absolute;
    right: 0;
    top: 0;
    width: var(--et-size-800);
    display: flex;
    flex-direction: column;
  }

  .alias-editor-header {
    font-size: 14px;
    color: #333;
  }
}
</style>
