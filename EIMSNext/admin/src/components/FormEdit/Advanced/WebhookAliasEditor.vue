<template>
  <div class="api-config-pane">
    <div class="webhook-alias-editor">
      <div class="alias-editor-body">
        <div class="alias-tip">
          注：字段别名仅允许使用
          <span class="tip-key">「小写字母」</span>
          <span class="tip-key">「数字」</span>
          和
          <span class="tip-key">「下划线」</span>
          组合，且必须以
          <span class="tip-key">「小写字母」</span>
          开头
        </div>
        <el-table :data="aliasFields" border class="alias-table">
          <el-table-column prop="name" label="字段名称" min-width="200" />
          <el-table-column prop="idFmt" label="字段ID" min-width="300" />
          <el-table-column prop="type" label="字段类型" width="100" />
          <el-table-column width="200">
            <template #header>
              <div class="alias-header-cell">
                <span>字段别名</span>
                <el-tooltip content="推送时将使用这里配置的别名作为字段名" placement="top">
                  <el-icon class="alias-help-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <template #default="scope">
              <el-input
                v-model="scope.row.alias"
                class="alias-input"
                placeholder="请输入别名"
                maxlength="64"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="alias-editor-footer">
        <el-button type="primary" class="save-button" @click="saveAlias">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QuestionFilled } from "@element-plus/icons-vue";
import { ref, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { webhookAliasService } from "@eimsnext/services";
import type { FieldAliasItem, FieldDef, FormDef, WebhookAlias } from "@eimsnext/models";
import { FieldType } from "@eimsnext/models";
import buildQuery from "odata-query";

const props = defineProps<{
  formDef: FormDef;
}>();

const emit = defineEmits<{
  (evt: "saved"): void;
}>();

const aliasFields = ref<FieldAliasRow[]>([]);
const currentAliasId = ref("");

type FieldAliasRow = {
  name: string;
  id: string;
  idFmt: string;
  type: string;
  alias?: string;
  parentId?: string;
  parentField?: string;
  isSubField?: boolean;
};

const fieldTypeMap: Record<string, string> = {
  [FieldType.Input]: "string",
  [FieldType.TextArea]: "string",
  [FieldType.TimeStamp]: "number",
  [FieldType.Number]: "number",
  [FieldType.Radio]: "json",
  [FieldType.CheckBox]: "array",
  [FieldType.Select1]: "json",
  [FieldType.Select2]: "array",
  [FieldType.ImageUpload]: "array",
  [FieldType.FileUpload]: "array",
  [FieldType.TableForm]: "array",
  [FieldType.Employee1]: "json",
  [FieldType.Employee2]: "array",
  [FieldType.Department1]: "json",
  [FieldType.Department2]: "array",
};

const resolveFieldTypeName = (type?: string) => fieldTypeMap[type ?? ""] ?? "string";

const flattenFieldRows = (items: FieldDef[] = [], parent?: FieldDef): FieldAliasRow[] => {
  return items.flatMap((item) => {
    const id = parent ? `${parent.field}>${item.field}` : item.field;
    const idFmt = parent ? `${parent.field} > ${item.field}` : item.field;
    const row: FieldAliasRow = {
      name: parent ? `${parent.title} > ${item.title}` : item.title,
      id,
      idFmt,
      type: resolveFieldTypeName(item.type),
      alias: "",
      parentId: parent?.field,
      parentField: parent?.field,
      isSubField: !!parent,
    };

    if (item.type === FieldType.TableForm && item.columns?.length) {
      return [row, ...flattenFieldRows(item.columns, item)];
    }

    return [row];
  });
};

const flattenAliasItems = (
  items: FieldAliasItem[] = [],
  parentField?: string
): Record<string, string> => {
  return items.reduce<Record<string, string>>((acc, item) => {
    const fieldKey = parentField ? `${parentField}>${item.field}` : item.field;
    acc[fieldKey] = item.alias ?? "";
    if (item.children?.length) {
      Object.assign(acc, flattenAliasItems(item.children, item.field));
    }
    return acc;
  }, {});
};

const buildNestedAliasItems = (rows: FieldAliasRow[]): FieldAliasItem[] => {
  const rootItems = rows.filter((row) => !row.isSubField);
  return rootItems.map((row) => {
    const children = rows
      .filter((child) => child.parentField === row.id)
      .map((child) => ({
        field: child.id.split(">").pop() ?? child.id,
        alias: child.alias?.trim() ?? "",
      }))
      .filter((child) => child.alias);

    const item: FieldAliasItem = {
      field: row.id,
      alias: row.alias?.trim() ?? "",
    };

    if (children.length > 0) {
      item.children = children;
    }

    return item;
  });
};

const loadAlias = async () => {
  if (!props.formDef?.id) return;

  try {
    const query = buildQuery({
      filter: {
        appId: props.formDef.appId,
        formId: props.formDef.id,
      },
    });
    const result = await webhookAliasService.query<WebhookAlias>(query);
    const alias = result[0];
    currentAliasId.value = alias?.id ?? "";
    const aliasMap = flattenAliasItems(alias?.fieldAlias ?? []);
    aliasFields.value = flattenFieldRows(props.formDef?.content?.items ?? []).map((row) => ({
      ...row,
      alias: aliasMap[row.id] ?? "",
    }));
  } catch (error) {
    console.error("Failed to load alias:", error);
  }
};

const saveAlias = async () => {
  const request = {
    id: currentAliasId.value,
    appId: props.formDef.appId,
    formId: props.formDef.id,
    fieldAlias: buildNestedAliasItems(aliasFields.value),
  };

  try {
    if (currentAliasId.value) {
      const result = await webhookAliasService.patch<WebhookAlias>(currentAliasId.value, request);
      currentAliasId.value = result.id;
    } else {
      const result = await webhookAliasService.post<WebhookAlias>(request);
      currentAliasId.value = result.id;
    }

    ElMessage.success("保存成功");
    emit("saved");
  } catch (error) {
    ElMessage.error("保存失败");
  }
};

onMounted(() => {
  loadAlias();
});

watch(
  () => props.formDef?.content?.items,
  () => {
    loadAlias();
  }
);
</script>

<style lang="scss" scoped>
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
    box-shadow: var(--et-shadow-overlay);
    bottom: 0;
    left: 0;
    margin: var(--et-space-20) auto;
    position: absolute;
    right: 0;
    top: 0;
    width: var(--et-size-850);
    display: flex;
    flex-direction: column;
  }

  .alias-editor-body {
    flex: 1;
    overflow: auto;
    padding: 25px;
  }

  .alias-tip {
    color: var(--et-text-primary);
    font-size: var(--et-font-size-12);
    line-height: 1.8;
    margin-bottom: 20px;
  }

  .tip-key {
    font-weight: 700;
  }

  .alias-table {
    width: 100%;
  }

  :deep(.alias-table .el-table__inner-wrapper) {
    background-color: var(--et-bg-container);
  }

  .alias-header-cell {
    align-items: center;
    display: inline-flex;
  }

  .alias-help-icon {
    color: var(--et-text-tertiary);
    font-size: 14px;
  }

  .alias-editor-footer {
    align-items: center;
    border-top: 1px solid var(--et-border-color);
    display: flex;
    justify-content: center;
    padding: 20px 0;
  }

  .save-button {
    min-width: 170px;
  }

  :deep(.el-table th.el-table__cell) {
    background-color: var(--et-bg-container);
    color: var(--et-text-secondary);
    font-size: var(--et-font-size-14);
    font-weight: 500;
    height: 35px;
    padding: 0;
  }

  :deep(.el-table td.el-table__cell) {
    color: var(--et-text-primary);
    font-size: var(--et-font-size-15);
    height: 35px;
    padding: 0;
  }

  :deep(.alias-table .el-table__cell .cell) {
    line-height: 35px;
  }

  :deep(.alias-input) {
    display: block;
    margin: 0 -12px;
    width: calc(100% + 24px);
  }

  :deep(.alias-input .el-input__wrapper) {
    background: var(--et-bg-container);
    border-radius: 0;
    box-shadow: none;
    padding: 0 12px;
  }

  :deep(.alias-input .el-input__inner) {
    height: 34px;
    line-height: 34px;
  }

  :deep(.el-table--border::before),
  :deep(.el-table--group::after),
  :deep(.el-table::before) {
    background-color: var(--et-border-color);
  }

  :deep(.alias-table .el-table__body td.el-table__cell:last-child) {
    padding: 0;
  }

  :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--et-color-primary) inset;
  }
}
</style>
