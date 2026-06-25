<template>
  <div class="tab-content">
    <div class="link-row">
      <el-switch v-model="datalink.enabled" @change="markDirty" />
      <el-input :model-value="datalinkUrl" readonly class="link-input" />
      <el-button @click="copyText(datalinkUrl)">{{ t("common.copy") }}</el-button>
      <el-button @click="openUrl(datalinkUrl)">{{ t("common.open") }}</el-button>
    </div>

    <div class="form-group">
      <label class="group-label">{{ t("publicpublish.datalinkFields") }}</label>
      <el-select
        v-model="visibleFieldKeys"
        multiple
        filterable
        collapse-tags
        collapse-tags-tooltip
        :placeholder="t('publicpublish.allFieldsDefault')"
        class="full"
        @change="onVisibleFieldsChange"
      >
        <el-option v-for="field in selectableFields" :key="field.field" :label="field.title" :value="field.field" />
      </el-select>
      <p class="field-tip">{{ t("publicpublish.visibleFieldsTip") }}</p>
    </div>

    <LimitSection
      :enabled="datalink.accessCodeEnabled || false"
      :access-code="accessCodeInput"
      :expire-time="datalink.expireTime ?? null"
      @update:enabled="datalink.accessCodeEnabled = $event; markDirty()"
      @update:access-code="onAccessCodeChange"
      @update:expire-time="datalink.expireTime = $event ?? undefined; markDirty()"
      @change="markDirty"
    />

    <el-button type="primary" @click="save">
      {{ t("common.save") }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import {
  FieldDef,
  FieldType,
  FormDef,
  PublicDataLinkSetting,
  PublicFieldPermission,
  PublicSetting,
  PublicTargetType,
} from "@eimsnext/models";
import { publicSettingService } from "@eimsnext/services";
import { sha256 } from "@eimsnext/utils";
import LimitSection from "./LimitSection.vue";
import { isPublicSystemFieldDef } from "@/views/public/publicSystemFields";

const { t } = useI18n();

const props = defineProps<{
  formDef: FormDef;
  publicSetting: PublicSetting;
}>();

const datalink = ref<PublicDataLinkSetting>({
  enabled: false,
  accessCodeEnabled: false,
  accessCodeHash: "",
  fields: [],
});

const accessCodeInput = ref("");
const visibleFieldKeys = ref<string[]>([]);
const isDirtyState = ref(false);

const datalinkUrl = computed(
  () => `${window.location.origin}${window.location.pathname}#/public/form/${props.formDef.id}/data/{dataId}`,
);

const selectableFields = computed(() => flattenFields(props.formDef.content?.items || []));

watch(
  () => props.publicSetting,
  (setting) => {
    datalink.value = {
      enabled: setting.form?.dataLink?.enabled ?? false,
      accessCodeEnabled: setting.form?.dataLink?.accessCodeEnabled ?? false,
      accessCodeHash: setting.form?.dataLink?.accessCodeHash ?? "",
      expireTime: setting.form?.dataLink?.expireTime,
      fields: [...(setting.form?.dataLink?.fields ?? [])],
    };
    visibleFieldKeys.value = (datalink.value.fields || [])
      .filter((field) => field.visible !== false)
      .map((field) => field.field);
    isDirtyState.value = false;
  },
  { immediate: true, deep: true },
);

function markDirty() {
  isDirtyState.value = true;
}

function onAccessCodeChange(v: string) {
  accessCodeInput.value = v;
  markDirty();
}

function onVisibleFieldsChange() {
  const selected = new Set(visibleFieldKeys.value);
  datalink.value.fields = selectableFields.value.map<PublicFieldPermission>((field) => ({
    field: field.field,
    visible: selected.size === 0 || selected.has(field.field),
    editable: false,
  }));
  markDirty();
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
  ElMessage.success(t("common.copied"));
}

function openUrl(url: string) {
  window.open(url, "_blank");
}

function flattenFields(fields: FieldDef[]) {
  const result: { field: string; title: string }[] = [];
  fields.forEach((field) => {
    const publicSystemField = isPublicSystemFieldDef(field);
    if ((!publicSystemField && field.hidden) || isOrgField(field.type)) {
      return;
    }
    if (field.type === FieldType.TableForm && field.columns?.length) {
      field.columns.forEach((sub) => {
        const publicSystemSubField = isPublicSystemFieldDef(sub);
        if ((publicSystemSubField || !sub.hidden) && !isOrgField(sub.type)) {
          result.push({ field: `${field.field}>${sub.field}`, title: `${field.title}.${sub.title}` });
        }
      });
      return;
    }
    result.push({ field: field.field, title: field.title });
  });
  return result;
}

function isOrgField(type?: string) {
  return (
    type === FieldType.Department1 ||
    type === FieldType.Department2 ||
    type === FieldType.Employee1 ||
    type === FieldType.Employee2
  );
}

async function save() {
  if (accessCodeInput.value) {
    datalink.value.accessCodeHash = await sha256(accessCodeInput.value);
    accessCodeInput.value = "";
  }
  const updated = { ...props.publicSetting };
  updated.form = updated.form || ({} as any);
  updated.form.dataLink = { ...datalink.value };
  if (!accessCodeInput.value && !datalink.value.accessCodeHash) {
    updated.form.dataLink.accessCodeEnabled = false;
  }
  await publicSettingService.patch<PublicSetting>(updated.id, {
    id: updated.id,
    appId: updated.appId,
    targetType: PublicTargetType.Form,
    targetId: updated.targetId,
    form: updated.form,
  });
  isDirtyState.value = false;
  ElMessage.success(t("common.saveSuccess"));
}

defineExpose({
  isDirty: () => isDirtyState.value,
  save,
});
</script>

<style scoped lang="scss">
.tab-content {
  padding: var(--et-space-12) 0;
}

.link-row {
  align-items: center;
  display: flex;
  gap: var(--et-space-12);
  margin-bottom: var(--et-space-16);

  .link-input {
    flex: 1;
  }
}

.form-group {
  margin-bottom: var(--et-space-12);
}

.group-label {
  color: var(--et-text-primary);
  display: block;
  font-size: var(--et-font-size-13);
  font-weight: 600;
  margin-bottom: var(--et-space-8);
}

.field-tip {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-12);
  margin-top: var(--et-space-6);
}

.full {
  width: 100%;
}
</style>
