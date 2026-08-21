<template>
  <div class="tab-content">
    <div class="link-row">
      <el-switch v-model="querylink.enabled" @change="markDirty" />
      <template v-if="querylink.enabled">
        <ShareLinkBar :url="querylinkUrl" class="share-link" />
        <el-button @click="showEmbed = true">{{ t("publicpublish.embed") }}</el-button>
      </template>
    </div>

    <template v-if="querylink.enabled">
    <h4 class="section-title">{{ t("publicpublish.queryPageSettings") }}</h4>

    <div class="form-group">
      <label class="group-label">{{ t("publicpublish.queryFields") }}</label>
      <el-select
        v-model="querylink.queryFields"
        multiple
        filterable
        collapse-tags
        collapse-tags-tooltip
        :max-collapse-tags="5"
        :placeholder="t('publicpublish.top5FieldsDefault')"
        class="full"
        @change="markDirty"
      >
        <el-option v-for="field in queryableFields" :key="field.field" :label="field.title" :value="field.field" />
      </el-select>
    </div>

    <div class="form-group">
      <label class="group-label">{{ t("publicpublish.displayFields") }}</label>
      <el-select
        v-model="querylink.displayFields"
        multiple
        filterable
        collapse-tags
        collapse-tags-tooltip
        :max-collapse-tags="5"
        :placeholder="t('publicpublish.top5FieldsDefault')"
        class="full"
        @change="markDirty"
      >
        <el-option v-for="field in displayableFields" :key="field.field" :label="field.title" :value="field.field" />
      </el-select>
    </div>

    <el-dialog v-model="showEmbed" :title="t('publicpublish.embed')" width="640px">
      <p class="embed-desc">{{ t("publicpublish.embedDesc") }}</p>
      <div class="embed-row">
        <label class="embed-label">{{ t("publicpublish.embedLink") }}</label>
        <el-input :model-value="querylinkUrl" readonly>
          <template #append>
            <el-button @click="copyText(querylinkUrl)">{{ t("common.copy") }}</el-button>
          </template>
        </el-input>
      </div>
      <div class="embed-row">
        <label class="embed-label">{{ t("publicpublish.embedCode") }}</label>
        <el-input v-model="iframeCode" type="textarea" :rows="2" readonly>
          <template #append>
            <el-button @click="copyText(iframeCode)">{{ t("common.copy") }}</el-button>
          </template>
        </el-input>
      </div>
    </el-dialog>

    <LimitSection
      :enabled="querylink.accessCodeEnabled || false"
      :access-code="accessCodeInput"
      :expire-time="querylink.expireTime ?? null"
      @update:enabled="querylink.accessCodeEnabled = $event; markDirty()"
      @update:access-code="onAccessCodeChange"
      @update:expire-time="querylink.expireTime = $event ?? undefined; markDirty()"
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
  PublicQueryLinkSetting,
  PublicSetting,
  PublicTargetType,
} from "@eimsnext/models";
import { publicSettingService } from "@eimsnext/services";
import { ShareLinkBar } from "@eimsnext/components";
import { sha256 } from "@eimsnext/utils";
import LimitSection from "./LimitSection.vue";
import { isPublicSystemFieldDef } from "@/utils/publicSystemFields";

const { t } = useI18n();

const props = defineProps<{
  formDef: FormDef;
  publicSetting: PublicSetting;
}>();

const querylink = ref<PublicQueryLinkSetting>({
  enabled: false,
  accessCodeEnabled: false,
  accessCodeHash: "",
  queryFields: [],
  displayFields: [],
});

const accessCodeInput = ref("");
const showEmbed = ref(false);
const isDirtyState = ref(false);

const querylinkUrl = computed(
  () => `${window.location.origin}${window.location.pathname}#/public/form/${props.formDef.id}/query`,
);

const iframeCode = computed(
  () => `<iframe width="100%" height="100%" style="border: none;" src="${querylinkUrl.value}"></iframe>`,
);

const queryableFields = computed(() => flattenFields(props.formDef.content?.items || [], isPublicQueryField));
const displayableFields = computed(() => flattenFields(props.formDef.content?.items || [], isPublicDisplayField));

watch(
  () => props.publicSetting,
  (setting) => {
    querylink.value = {
      enabled: setting.form?.queryLink?.enabled ?? false,
      accessCodeEnabled: setting.form?.queryLink?.accessCodeEnabled ?? false,
      accessCodeHash: setting.form?.queryLink?.accessCodeHash ?? "",
      expireTime: setting.form?.queryLink?.expireTime,
      queryFields: (setting.form?.queryLink?.queryFields ?? []).filter((field) => queryableFields.value.some((item) => item.field === field)),
      displayFields: [...(setting.form?.queryLink?.displayFields ?? [])],
    };
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

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
  ElMessage.success(t("common.copied"));
}

function flattenFields(fields: FieldDef[], isSupported: (type?: FieldType | string) => boolean) {
  const result: { field: string; title: string }[] = [];
  fields.forEach((field) => {
    const publicSystemField = isPublicSystemFieldDef(field);
    if ((!publicSystemField && field.hidden) || (field.type !== FieldType.TableForm && !isSupported(field.type))) {
      return;
    }
    if (field.type === FieldType.TableForm && field.columns?.length) {
      field.columns.forEach((sub) => {
        const publicSystemSubField = isPublicSystemFieldDef(sub);
        if ((publicSystemSubField || !sub.hidden) && isSupported(sub.type)) {
          result.push({ field: `${field.field}>${sub.field}`, title: `${field.title}.${sub.title}` });
        }
      });
      return;
    }
    result.push({ field: field.field, title: field.title });
  });
  return result;
}

function isPublicDisplayField(type?: FieldType | string) {
  return ![FieldType.DataSelect, FieldType.FileUpload, FieldType.ImageUpload, FieldType.Signature, FieldType.TableForm].includes(type as FieldType);
}

function isPublicQueryField(type?: FieldType | string) {
  return [
    FieldType.Input,
    FieldType.TextArea,
    FieldType.SerialNo,
    FieldType.Radio,
    FieldType.Select1,
    FieldType.Number,
    FieldType.TimeStamp,
  ].includes(type as FieldType);
}

async function save() {
  if (accessCodeInput.value) {
    querylink.value.accessCodeHash = await sha256(accessCodeInput.value);
    accessCodeInput.value = "";
  }
  const updated = { ...props.publicSetting };
  updated.form = updated.form || ({} as any);
  updated.form.queryLink = { ...querylink.value };
  if (!accessCodeInput.value && !querylink.value.accessCodeHash) {
    updated.form.queryLink.accessCodeEnabled = false;
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

.section-title {
  color: var(--et-text-primary);
  font-size: var(--et-font-size-14);
  font-weight: 600;
  margin-bottom: var(--et-space-12);
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

.full {
  width: 100%;
}

.embed-desc {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-13);
  margin-bottom: var(--et-space-12);
}

.embed-row {
  margin-bottom: var(--et-space-12);
}

.embed-label {
  color: var(--et-text-primary);
  display: block;
  font-size: var(--et-font-size-13);
  font-weight: 600;
  margin-bottom: var(--et-space-8);
}
</style>
