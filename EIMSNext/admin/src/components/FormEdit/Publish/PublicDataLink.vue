<template>
  <div class="tab-content">
    <div class="link-row">
      <el-switch v-model="datalink.enabled" @change="markDirty" />
    </div>

    <template v-if="datalink.enabled">
      <div class="permission-row">
        <el-button type="primary" @click="openFieldPerms">
          {{ t("publicpublish.fieldPermission") }}
        </el-button>
        <span>{{ permissionSummary }}</span>
      </div>

      <el-dialog v-model="showFieldPermDialog" class="field-permission-dialog" width="465px" :title="t('publicpublish.fieldPermissionTitle')">
        <div class="permission-toolbar">
          <span>{{ t("publicpublish.fieldPermissionDesc") }}</span>
          <el-input v-model="fieldPermSearch" :placeholder="t('common.search')" clearable class="permission-search" />
        </div>
        <EtFieldPerms
          :model-value="visibleFieldPermItems"
          :fields="permissionFields"
          :default-visbile="true"
          class="permission-list"
          @update:model-value="mergeFieldPerms"
        />
        <template #footer>
          <el-button @click="showFieldPermDialog = false">{{ t("common.cancel") }}</el-button>
          <el-button type="primary" @click="saveFieldPerms">{{ t("common.save") }}</el-button>
        </template>
      </el-dialog>

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
    </template>
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
  PublicSetting,
  PublicTargetType,
} from "@eimsnext/models";
import { publicSettingService } from "@eimsnext/services";
import { sha256 } from "@eimsnext/utils";
import LimitSection from "./LimitSection.vue";
import { isPublicSystemFieldDef } from "@/utils/publicSystemFields";

interface IFieldPermItem {
  id: string;
  visible: boolean;
  editable: boolean;
  tableInsert?: boolean;
  tableEdit?: boolean;
  tableDelete?: boolean;
}

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
const showFieldPermDialog = ref(false);
const fieldPermSearch = ref("");
const fieldPermItems = ref<IFieldPermItem[]>([]);
const isDirtyState = ref(false);

const selectableFields = computed(() => flattenFields(props.formDef.content?.items || []));
const publicPermissionFields = computed(() => {
  const fields = props.formDef.content?.items || [];
  return filterPublicFields(fields);
});
const permissionFields = computed(() => {
  const fields = publicPermissionFields.value;
  const keyword = fieldPermSearch.value.trim().toLowerCase();
  if (!keyword) return fields;
  return fields.reduce<FieldDef[]>((result, field) => {
    const fieldMatch = field.title.toLowerCase().includes(keyword);
    if (field.type === FieldType.TableForm && field.columns?.length) {
      const columns = field.columns.filter((column) =>
        fieldMatch || column.title.toLowerCase().includes(keyword),
      );
      if (fieldMatch || columns.length) result.push({ ...field, columns });
    } else if (fieldMatch) {
      result.push(field);
    }
    return result;
  }, []);
});
const visibleFieldPermIds = computed(() => new Set(flattenFields(permissionFields.value).map((field) => field.field)));
const visibleFieldPermItems = computed(() => fieldPermItems.value.filter((item) => visibleFieldPermIds.value.has(item.id)));
const permissionSummary = computed(() => {
  const fields = datalink.value.fields || [];
  const visible = fields.filter((item) => item.visible !== false).length;
  const editable = fields.filter((item) => item.editable).length;
  const total = selectableFields.value.length;
  if (total > 0 && visible >= total) {
    return t("publicpublish.fieldPermissionSummaryAll", { editable });
  }
  return t("publicpublish.fieldPermissionSummary", { visible, editable });
});

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
    fieldPermItems.value = (datalink.value.fields || []).map((field) => ({
      id: field.field,
      visible: field.visible !== false,
      editable: field.editable !== false,
    }));
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

function openFieldPerms() {
  if (!fieldPermItems.value.length) {
    fieldPermItems.value = selectableFields.value.map((field) => ({ id: field.field, visible: true, editable: false }));
  }
  showFieldPermDialog.value = true;
}

function mergeFieldPerms(value: IFieldPermItem[]) {
  const updates = new Map(value.map((item) => [item.id, item]));
  fieldPermItems.value = fieldPermItems.value.map((item) => updates.get(item.id) || item);
}

function saveFieldPerms() {
  const permissions = new Map((datalink.value.fields || []).map((item) => [item.field, item]));
  fieldPermItems.value.forEach((item) => {
    permissions.set(item.id, { field: item.id, visible: item.visible, editable: item.editable });
  });
  datalink.value.fields = selectableFields.value.map((field) => permissions.get(field.field) || {
    field: field.field,
    visible: true,
    editable: false,
  });
  fieldPermSearch.value = "";
  showFieldPermDialog.value = false;
  markDirty();
}

function filterPublicFields(fields: FieldDef[]) {
  return fields.reduce<FieldDef[]>((result, field) => {
    const publicSystemField = isPublicSystemFieldDef(field);
    if ((!publicSystemField && field.hidden) || isOrgField(field.type)) return result;
    if (field.type === FieldType.TableForm && field.columns?.length) {
      const columns = field.columns.filter((column) => {
        const publicSystemSubField = isPublicSystemFieldDef(column);
        return (publicSystemSubField || !column.hidden) && !isOrgField(column.type);
      });
      if (columns.length) result.push({ ...field, columns });
      return result;
    }
    result.push(field);
    return result;
  }, []);
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
  padding: var(--et-space-8) 0;
}

.link-row {
  align-items: center;
  display: flex;
  gap: var(--et-space-8);
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

.permission-row {
  align-items: center;
  border-top: 1px solid var(--et-border-color-light);
  display: flex;
  gap: var(--et-space-12);
  margin: var(--et-space-8) 0 var(--et-space-16);
  padding-top: var(--et-space-16);

  span {
    color: var(--et-text-secondary);
    font-size: var(--et-font-size-12);
  }
}

.permission-toolbar {
  align-items: center;
  color: var(--et-text-secondary);
  display: flex;
  font-size: var(--et-font-size-13);
  gap: var(--et-space-12);
  margin-bottom: var(--et-space-8);
}

.permission-search {
  margin-left: auto;
  width: 160px;
}

.permission-list {
  height: 320px;
}
</style>
