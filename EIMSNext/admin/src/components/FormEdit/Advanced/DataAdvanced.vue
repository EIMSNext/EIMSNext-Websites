<template>
  <AdvanceLayout :title="t('admin.advanced.dataCollab')" :desc="t('admin.advanced.dataCollabDesc')">
    <template #headeractions>
      <span class="help-link">{{ t("admin.advanced.helpDoc") }}</span>
    </template>
    <div class="data-advanced">
      <div class="config-section">
        <div class="section-title">{{ t("admin.advanced.dataTitle") }}</div>
        <el-radio-group v-model="mode" class="mode-group">
          <el-radio value="default">{{ t("admin.advanced.defaultTitle") }}</el-radio>
          <el-radio value="custom">{{ t("admin.advanced.customTitle") }}</el-radio>
        </el-radio-group>

        <div v-if="mode === 'default'" class="default-title-box">
          {{ defaultFieldLabel || "-" }}
        </div>

        <div v-else class="editor-panel">
          <FieldBlockCodeEditor
            v-model="content"
            :formDef="formDef"
            :showSubFields="false"
            :maxBlocks="5"
            :maxRows="3"
            :placeholder="t('admin.advanced.dataTitlePlaceholder')"
          />
        </div>

        <el-button type="primary" class="save-button" @click="save">{{ t("common.save") }}</el-button>
      </div>
    </div>
  </AdvanceLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import AdvanceLayout from "./AdvanceLayout.vue";
import {
  FieldBlockCodeEditor,
  buildFieldBlockFields,
  getFieldBlockTokens,
} from "@eimsnext/components";
import { DataTitleSettings, FormDef, FormSettings } from "@eimsnext/models";
import { formDefService } from "@eimsnext/services";
import { useFormStore, useContextStore } from "@eimsnext/store";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineOptions({
  name: "DataAdvanced",
});

const props = defineProps<{
  formDef: FormDef;
}>();

const formStore = useFormStore();
const contextStore = useContextStore();

const mode = ref<"default" | "custom">("default");
const content = ref("");

const businessFields = computed(() =>
  buildFieldBlockFields(props.formDef, {
    showSubFields: false,
    showSystemFields: false,
  })
);

const defaultFieldLabel = computed(() => businessFields.value[0]?.label || "");

watch(
  () => props.formDef.formSettings?.advanced?.dataTitle,
  (dataTitle) => {
    mode.value = dataTitle?.mode === "custom" ? "custom" : "default";
    content.value = dataTitle?.content || "";
  },
  { immediate: true, deep: true }
);

function ensureFormSettings() {
  const formSettings: FormSettings = props.formDef.formSettings
    ? JSON.parse(JSON.stringify(props.formDef.formSettings))
    : {};

  formSettings.advanced ??= {};
  return formSettings;
}

function validateCustomTitle() {
  const tokens = getFieldBlockTokens(content.value);
  if (tokens.length === 0) {
    ElMessage.error(t("admin.advanced.minFieldError"));
    return false;
  }

  if (tokens.length > 5) {
    ElMessage.error(t("admin.advanced.maxFieldError"));
    return false;
  }

  return true;
}

async function save() {
  if (mode.value === "custom" && !validateCustomTitle()) {
    return;
  }

  const formSettings = ensureFormSettings();
  const dataTitle: DataTitleSettings = {
    mode: mode.value,
    content: mode.value === "custom" ? content.value : "",
  };
  formSettings.advanced!.dataTitle = dataTitle;

  const request = {
    id: props.formDef.id,
    appId: props.formDef.appId,
    name: props.formDef.name,
    content: props.formDef.content,
    isLedger: props.formDef.isLedger,
    usingWorkflow: props.formDef.usingWorkflow,
    formSettings,
  };

  try {
    const resp = await formDefService.patch<FormDef>(props.formDef.id, request);
    props.formDef.formSettings = resp.formSettings;
    formStore.update(resp);
    contextStore.setAppChanged();
    ElMessage.success(t("common.saveSuccess"));
  } catch {
    ElMessage.error(t("common.saveFailed"));
  }
}
</script>

<style scoped lang="scss">
.help-link {
  color: var(--et-color-primary);
  cursor: default;
  font-size: var(--et-font-size-12);
}

.data-advanced {
  max-width: 720px;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-16);
}

.section-title {
  color: var(--et-text-primary);
  font-size: var(--et-font-size-16);
  font-weight: 500;
}

.mode-group {
  display: flex;
  gap: var(--et-space-20);
}

.default-title-box {
  display: flex;
  align-items: center;
  min-height: 30px;
  width: 100%;
  padding: 0 10px;
  border: 1px solid var(--et-border-color);
  border-radius: var(--et-size-6);
  background: var(--et-bg-container);
  color: var(--et-text-primary);
}

.editor-panel {
  width: 100%;
}

.save-button {
  width: fit-content;
}
</style>
