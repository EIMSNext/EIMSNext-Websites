<template>
  <el-dialog
    :model-value="modelValue"
    :title="t('admin.apiKeyMgmt.apiScopeDialog.title')"
    width="780px"
    :close-on-click-modal="false"
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
    @open="onOpen"
  >
    <div class="api-scope-dialog">
      <div class="top-row">
        <el-input
          v-model="search"
          :placeholder="t('admin.apiKeyMgmt.apiScopeDialog.search')"
          clearable
        >
          <template #prefix>
            <et-icon icon="el-Search" />
          </template>
        </el-input>
      </div>

      <div v-if="selectedCodes.length > 0" class="selected-row">
        <el-tag
          v-for="ra in value"
          :key="ra.resource"
          closable
          type="info"
          @close="removeResource(ra.resource)"
        >
          {{ resourceLabel(ra.resource) }}
        </el-tag>
      </div>

      <div class="body">
        <div class="left">
          <div
            v-for="group in groupedResources"
            :key="group.key"
            class="group-block"
          >
            <div class="group-title">{{ group.title }}</div>
            <div
              v-for="r in group.items"
              :key="r.code"
              class="resource-row"
              :class="{ active: selectedCodes.includes(r.code) }"
              @click="selectResource(r.code)"
            >
              <et-icon :icon="resourceIcon(r.code)" />
              <span class="resource-label">{{ resourceLabel(r.code) }}</span>
            </div>
          </div>
        </div>

        <div class="right">
          <div v-if="!activeResource" class="empty">
            {{ t("admin.apiKeyMgmt.apiScopeDialog.noSelection") }}
          </div>
          <div v-else class="action-list">
            <div class="resource-title">
              {{ resourceLabel(activeResource.code) }}
            </div>
            <el-switch
              v-for="act in activeResource.actions"
              :key="act.key"
              v-model="actionSwitch[act.key]"
              class="action-switch"
              :active-text="actionLabel(activeResource.code, act.key)"
              @change="onActionChange"
            />
            <p v-if="actionHint" class="hint">{{ actionHint }}</p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">{{ t("common.cancel") }}</el-button>
      <el-button type="primary" @click="confirm">
        {{ t("common.confirm") }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import {
  type ResourceActionGrant,
  type ResourceCode,
  type ResourceSpec,
  Resources,
  ResourceActionFlag,
} from "@eimsnext/models";

const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean;
  value: ResourceActionGrant[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "update:value", v: ResourceActionGrant[]): void;
}>();

const search = ref("");

const actionSwitch = reactive<Record<string, boolean>>({});
const activeCode = ref<ResourceCode | null>(null);

const activeResource = computed<ResourceSpec | null>(() => {
  if (!activeCode.value) return null;
  return Resources.find((r) => r.code === activeCode.value) ?? null;
});

const actionHint = computed<string | null>(() => {
  const r = activeResource.value;
  if (!r) return null;
  for (const a of r.actions) {
    if (!actionSwitch[a.key]) continue;
    const hint = actionHintLabel(r.code, a.key);
    if (hint) return hint;
  }
  return null;
});

const selectedCodes = computed(() => props.value.map((r) => r.resource));

const filteredResources = computed(() => {
  const k = search.value.trim().toLowerCase();
  if (!k) return Resources;
  return Resources.filter(
    (r) =>
      resourceLabel(r.code).toLowerCase().includes(k) ||
      r.code.toLowerCase().includes(k) ||
      r.actions.some((a) => actionLabel(r.code, a.key).toLowerCase().includes(k)),
  );
});

const groupedResources = computed(() => {
  const groups: Record<string, ResourceSpec[]> = {};
  for (const r of filteredResources.value) {
    if (!groups[r.group]) groups[r.group] = [];
    groups[r.group].push(r);
  }
  return [
    { key: "contacts", title: t("admin.apiKeyMgmt.apiScopeDialog.groups.contacts"), items: groups["通讯录"] ?? [] },
    { key: "apps",     title: t("admin.apiKeyMgmt.apiScopeDialog.groups.apps"),     items: groups["应用"]   ?? [] },
    { key: "workflow", title: t("admin.apiKeyMgmt.apiScopeDialog.groups.workflow"), items: groups["工作流"] ?? [] },
  ];
});

function i18nValue(path: string, fallback: string): string {
  const value = t(path);
  return value === path ? fallback : value;
}

function resourceKey(code: ResourceCode): string {
  return code.replace(/\./g, "_");
}

function resourceLabel(code: ResourceCode): string {
  return i18nValue(`admin.apiKeyMgmt.resources.${resourceKey(code)}`, code);
}

function actionLabel(resource: ResourceCode, key: string): string {
  const fallback = i18nValue(`admin.apiKeyMgmt.actions.${key}`, key);
  return i18nValue(`admin.apiKeyMgmt.resourceActions.${resourceKey(resource)}.${key}`, fallback);
}

function actionHintLabel(resource: ResourceCode, key: string): string {
  return i18nValue(`admin.apiKeyMgmt.actionHints.${resourceKey(resource)}.${key}`, "");
}

function resourceIcon(code: ResourceCode): string {
  switch (code) {
    case "employee":
    case "department":
    case "role":
    case "roleGroup":
      return "el-User";
    case "appdef":
    case "formdef":
      return "el-Memo";
    case "formdata":
      return "el-Document";
    case "workflow.instance":
    case "workflow.task":
      return "el-CircleCheck";
    default:
      return "el-Key";
  }
}

function selectResource(code: ResourceCode) {
  activeCode.value = code;
  const existing = props.value.find((r) => r.resource === code);
  const r = Resources.find((x) => x.code === code);
  if (!r) return;
  // 初始化所有 action 开关
  for (const a of r.actions) {
    if (existing) {
      actionSwitch[a.key] = !!(existing.actions & a.flag);
    } else {
      actionSwitch[a.key] = false;
    }
  }
}

function onActionChange() {
  if (!activeCode.value) return;
  const r = Resources.find((x) => x.code === activeCode.value);
  if (!r) return;
  let actions = 0;
  for (const a of r.actions) {
    if (actionSwitch[a.key]) actions |= a.flag;
  }
  const next = props.value.filter((x) => x.resource !== activeCode.value);
  if (actions !== 0) {
    next.push({ resource: activeCode.value, actions });
  }
  emit("update:value", next);
}

function removeResource(code: ResourceCode) {
  emit(
    "update:value",
    props.value.filter((x) => x.resource !== code),
  );
  if (activeCode.value === code) {
    activeCode.value = null;
  }
}

function confirm() {
  emit("update:modelValue", false);
}

function onOpen() {
  if (props.value.length > 0) {
    selectResource(props.value[0].resource);
  } else {
    // 默认选第一个 standard 资源
    selectResource("employee");
  }
}
</script>

<style scoped lang="scss">
.api-scope-dialog {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.top-row {
  display: flex;
  gap: 8px;
}

.selected-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 8px;
  border: 1px dashed var(--et-border-color-light);
  border-radius: 6px;
  background: color-mix(in srgb, var(--et-fill-color-light) 60%, transparent);
  min-height: 32px;
}

.body {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 12px;
  height: 360px;
}

.left {
  border: 1px solid var(--et-border-color-light);
  border-radius: 6px;
  padding: 8px;
  overflow-y: auto;
}

.right {
  border: 1px solid var(--et-border-color-light);
  border-radius: 6px;
  padding: 16px;
  overflow-y: auto;
}

.group-block + .group-block {
  margin-top: 12px;
}
.group-title {
  font-size: 12px;
  color: var(--et-text-secondary);
  font-weight: 600;
  margin-bottom: 4px;
}

.resource-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--et-text-primary);
  &.active {
    background: color-mix(in srgb, var(--et-color-primary) 14%, transparent);
    color: var(--et-color-primary);
  }
  &:hover {
    background: var(--et-fill-color-light);
  }
}

.resource-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--et-text-primary);
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-switch {
  --el-switch-on-color: var(--et-color-primary);
  :deep(.el-switch__label) {
    color: var(--et-text-primary);
  }
}

.hint {
  font-size: 12px;
  color: var(--et-text-secondary);
  margin: 4px 0 0 56px;
}

.empty {
  color: var(--et-text-secondary);
  font-size: 13px;
  text-align: center;
  padding: 24px 0;
}

:global(html.dark) .left,
:global(html.dark) .right {
  background: color-mix(in srgb, var(--et-bg-container) 70%, transparent);
}
</style>
