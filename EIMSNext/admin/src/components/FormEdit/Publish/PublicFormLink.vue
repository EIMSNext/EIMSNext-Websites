<template>
  <div class="tab-content">
    <div class="link-row">
      <el-switch v-model="formlink.enabled" @change="markDirty" />
      <el-input :model-value="submitUrl" readonly class="link-input" />
      <el-button @click="copyText(submitUrl)">{{ t("common.copy") }}</el-button>
      <el-button @click="openUrl(submitUrl)">{{ t("common.open") }}</el-button>
      <el-button @click="showExtlink = !showExtlink">{{ t("publicpublish.extlink") }}</el-button>
    </div>

    <div v-if="showExtlink" class="extlink-panel">
      <div class="extlink-header">
        <strong>{{ t("publicpublish.extlink") }}</strong>
        <span class="extlink-sub">{{ t("publicpublish.extlinkManage") }}</span>
      </div>
      <div class="extlink-toggle">
        <el-switch v-model="formlink.extLink!.enabled" @change="markDirty" />
      </div>
      <div v-for="ext in formlink.extLink?.values || []" :key="ext" class="extlink-row">
        <span class="ext-name">{{ ext }}</span>
        <el-input :model-value="buildExtUrl(ext)" readonly />
        <el-button @click="copyText(buildExtUrl(ext))">{{ t("common.copy") }}</el-button>
        <el-button @click="removeExtValue(ext)">{{ t("common.delete") }}</el-button>
      </div>
      <el-input
        v-model="newExtValue"
        :placeholder="t('publicpublish.extlinkAddPlaceholder')"
        @keyup.enter="addExtValue"
      >
        <template #append>
          <el-button @click="addExtValue">{{ t("common.add") }}</el-button>
        </template>
      </el-input>
    </div>

    <div class="sub-section">
      <div class="sub-section__header">
        <strong>{{ t("publicpublish.wechatEnhance") }}</strong>
        <el-switch v-model="formlink.wechat!.enabled" @change="markDirty" />
        <span class="sub-section__tip">{{ t("publicpublish.wechatEnhanceTip") }}</span>
      </div>

      <div v-if="formlink.wechat?.enabled" class="sub-section__body">
        <div class="form-group">
          <label class="group-label">{{ t("publicpublish.wechatUserInfo") }}</label>
          <el-radio-group v-model="formlink.wechat.acquireMode" @change="markDirty">
            <el-radio :value="PublicWechatAcquireMode.SilentOpenId">
              {{ t("publicpublish.silentOpenId") }}
              <el-tooltip :content="t('publicpublish.silentOpenIdTip')">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-radio>
            <el-radio :value="PublicWechatAcquireMode.ExplicitGrant">
              {{ t("publicpublish.explicitGrant") }}
              <el-tooltip :content="t('publicpublish.explicitGrantTip')">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-radio>
          </el-radio-group>
        </div>

        <div class="form-group">
          <label class="group-label">{{ t("publicpublish.validate") }}</label>
          <el-checkbox v-model="formlink.oneSubmit" @change="markDirty">
            {{ t("publicpublish.oneSubmitPerUser") }}
          </el-checkbox>
        </div>

        <div class="form-group">
          <label class="group-label">{{ t("publicpublish.dataOps") }}</label>
          <el-checkbox v-model="formlink.viewOwnData" @change="markDirty">
            {{ t("publicpublish.viewOwnData") }}
          </el-checkbox>
          <el-checkbox v-model="formlink.editOwnData" @change="markDirty">
            {{ t("publicpublish.editOwnData") }}
          </el-checkbox>
        </div>
      </div>
    </div>

    <LimitSection
      :enabled="formlink.accessCodeEnabled || false"
      :access-code="accessCodeInput"
      :expire-time="formlink.expireTime ?? null"
      @update:enabled="formlink.accessCodeEnabled = $event; markDirty()"
      @update:access-code="onAccessCodeChange"
      @update:expire-time="formlink.expireTime = $event ?? undefined; markDirty()"
      @change="markDirty"
    />

    <el-button type="primary" @click="save">
      {{ t("common.save") }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { QuestionFilled } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import {
  FormDef,
  PublicFormLinkSetting,
  PublicSetting,
  PublicTargetType,
  PublicWechatAcquireMode,
} from "@eimsnext/models";
import { publicSettingService } from "@eimsnext/services";
import { sha256 } from "@eimsnext/utils";
import LimitSection from "./LimitSection.vue";

const { t } = useI18n();

const props = defineProps<{
  formDef: FormDef;
  publicSetting: PublicSetting;
}>();

const formlink = ref<PublicFormLinkSetting>({
  enabled: false,
  accessCodeEnabled: false,
  accessCodeHash: "",
  wechat: { enabled: false, acquireMode: PublicWechatAcquireMode.SilentOpenId },
  extLink: { enabled: false, values: [] },
  oneSubmit: false,
  viewOwnData: false,
  editOwnData: false,
});

const showExtlink = ref(false);
const newExtValue = ref("");
const accessCodeInput = ref("");

const isDirtyState = ref(false);

const submitUrl = computed(
  () => `${window.location.origin}${window.location.pathname}#/public/form/${props.formDef.id}/submit`,
);

function markDirty() {
  isDirtyState.value = true;
}

watch(
  () => props.publicSetting,
  (setting) => {
    formlink.value = {
      enabled: setting.form?.formLink?.enabled ?? false,
      accessCodeEnabled: setting.form?.formLink?.accessCodeEnabled ?? false,
      accessCodeHash: setting.form?.formLink?.accessCodeHash ?? "",
      expireTime: setting.form?.formLink?.expireTime,
      wechat: {
        enabled: setting.form?.formLink?.wechat?.enabled ?? false,
        acquireMode: setting.form?.formLink?.wechat?.acquireMode ?? PublicWechatAcquireMode.SilentOpenId,
      },
      extLink: {
        enabled: setting.form?.formLink?.extLink?.enabled ?? false,
        values: [...(setting.form?.formLink?.extLink?.values ?? [])],
      },
      oneSubmit: setting.form?.formLink?.oneSubmit ?? false,
      viewOwnData: setting.form?.formLink?.viewOwnData ?? false,
      editOwnData: setting.form?.formLink?.editOwnData ?? false,
    };
    showExtlink.value = formlink.value.extLink?.enabled ?? false;
    isDirtyState.value = false;
  },
  { immediate: true, deep: true },
);

function buildExtUrl(ext: string) {
  return `${submitUrl.value}&ext=${encodeURIComponent(ext)}`;
}

function addExtValue() {
  const value = newExtValue.value.trim();
  if (!value) return;
  const extLink = formlink.value.extLink;
  if (!extLink) return;
  const values = extLink.values || [];
  if (!values.includes(value)) {
    values.push(value);
  }
  extLink.values = values;
  newExtValue.value = "";
  markDirty();
}

function removeExtValue(value: string) {
  formlink.value.extLink!.values = (formlink.value.extLink!.values || []).filter((item) => item !== value);
  markDirty();
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
  ElMessage.success(t("common.copied"));
}

function openUrl(url: string) {
  window.open(url, "_blank");
}

function onAccessCodeChange(v: string) {
  accessCodeInput.value = v;
  markDirty();
}

async function save() {
  if (accessCodeInput.value) {
    formlink.value.accessCodeHash = await sha256(accessCodeInput.value);
    accessCodeInput.value = "";
  }
  const updated = { ...props.publicSetting };
  updated.form = updated.form || ({} as any);
  updated.form.formLink = { ...formlink.value };
  if (!accessCodeInput.value && !formlink.value.accessCodeHash) {
    updated.form.formLink.accessCodeEnabled = false;
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
  margin-bottom: var(--et-space-12);

  .link-input {
    flex: 1;
  }
}

.extlink-panel {
  background: var(--et-bg-page);
  border-radius: var(--et-radius-4);
  margin-bottom: var(--et-space-12);
  padding: var(--et-space-12);
}

.extlink-header {
  align-items: center;
  display: flex;
  gap: var(--et-space-8);
  margin-bottom: var(--et-space-8);

  .extlink-sub {
    color: var(--et-text-secondary);
    font-size: var(--et-font-size-12);
  }
}

.extlink-toggle {
  margin-bottom: var(--et-space-12);
}

.extlink-row {
  align-items: center;
  display: grid;
  gap: var(--et-space-8);
  grid-template-columns: 120px 1fr auto auto;
  margin-bottom: var(--et-space-8);
}

.sub-section {
  background: var(--et-bg-page);
  margin-bottom: var(--et-space-12);
  padding: var(--et-space-12);
}

.sub-section__header {
  align-items: center;
  display: flex;
  gap: var(--et-space-12);

  .sub-section__tip {
    color: var(--et-text-secondary);
    font-size: var(--et-font-size-12);
  }
}

.sub-section__body {
  margin-top: var(--et-space-12);
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
</style>
