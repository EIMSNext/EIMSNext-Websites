<template>
  <div class="tab-content">
    <div class="link-row">
      <el-switch v-model="formlink.enabled" @change="onEnabledChange" />
      <template v-if="formlink.enabled">
        <ShareLinkBar :url="submitUrl" class="share-link" />
        <el-button @click="showExtlink = true">{{ t("publicpublish.extlink") }}</el-button>
      </template>
    </div>

    <et-dialog
      v-model="showExtlink"
      :title="t('publicpublish.extlink')"
      width="720px"
      destroy-on-close
      :show-footer="false"
    >
      <div class="extlink-body">
        <el-tabs v-model="extlinkTab" stretch class="extlink-tabs">
          <el-tab-pane :label="t('publicpublish.extlinkAddPlaceholder')" name="extension">
            <p class="extlink-desc">{{ t("publicpublish.extlinkDesc") }}</p>
            <div class="extlink-toggle">
              <span class="extlink-sub">{{ t("publicpublish.extlinkManage") }}</span>
              <el-switch v-model="formlink.extLink!.enabled" @change="markDirty" />
            </div>
            <template v-if="formlink.extLink?.enabled">
              <div class="extlink-add-row">
                <span class="extlink-url">{{ submitUrl }}?ext=</span>
                <el-input
                  v-model="newExtValue"
                  :placeholder="t('publicpublish.extlinkAddPlaceholder')"
                  @keyup.enter="addExtValue"
                />
                <el-button type="primary" @click="addExtValue">{{ t("common.add") }}</el-button>
              </div>
              <div v-if="formlink.extLink.values?.length" class="extlink-list">
                <div class="extlink-list__header">
                  <span>{{ t("publicpublish.extlinkAddPlaceholder") }}</span>
                  <span>{{ t("publicpublish.extlinkLink") }}</span>
                </div>
                <div v-for="ext in formlink.extLink.values" :key="ext" class="extlink-row">
                  <span class="ext-name">{{ ext }}</span>
                  <ShareLinkBar :url="buildExtUrl(ext)" class="extlink-share-link" />
                  <el-button
                    text
                    circle
                    class="delete-button"
                    :aria-label="t('common.delete')"
                    @click="removeExtValue(ext)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane :label="t('publicpublish.embed')" name="embed">
            <EmbedLinkContent :url="submitUrl" :description="t('publicpublish.formEmbedDesc')" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </et-dialog>

    <template v-if="formlink.enabled">
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
    </template>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { QuestionFilled, Delete } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import {
  FormDef,
  PublicFormLinkSetting,
  PublicSetting,
  PublicTargetType,
  PublicWechatAcquireMode,
} from "@eimsnext/models";
import { publicSettingService } from "@eimsnext/services";
import { ShareLinkBar } from "@eimsnext/components";
import { sha256 } from "@eimsnext/utils";
import LimitSection from "./LimitSection.vue";
import EmbedLinkContent from "./EmbedLinkContent.vue";

const { t } = useI18n();

const props = defineProps<{
  formDef: FormDef;
  publicSetting: PublicSetting;
}>();

const emit = defineEmits<{ saved: [setting: PublicSetting] }>();

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
const extlinkTab = ref("extension");
const newExtValue = ref("");
const accessCodeInput = ref("");

const isDirtyState = ref(false);

const submitUrl = computed(
  () => `${window.location.origin}${window.location.pathname}#/public/form/${props.formDef.id}/submit`,
);

function markDirty() {
  isDirtyState.value = true;
}

async function onEnabledChange() {
  markDirty();
  await save();
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
    isDirtyState.value = false;
  },
  { immediate: true, deep: true },
);

function buildExtUrl(ext: string) {
  return `${submitUrl.value}?ext=${encodeURIComponent(ext)}`;
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
  const payload = {
    id: updated.id,
    appId: updated.appId,
    targetType: PublicTargetType.Form,
    targetId: updated.targetId,
    form: updated.form,
  };
  const saved = updated.id
    ? await publicSettingService.patch<PublicSetting>(updated.id, payload)
    : await publicSettingService.post<PublicSetting>(payload);
  emit("saved", saved);
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

.extlink-body {
  padding: var(--et-space-8) var(--et-space-20) var(--et-space-20);
  min-height: 450px;
}

.extlink-desc {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-13);
  margin: var(--et-space-16) 0 var(--et-space-12);
}

.extlink-toggle {
  align-items: center;
  display: flex;
  gap: var(--et-space-8);
  margin-bottom: var(--et-space-12);

  .extlink-sub {
    color: var(--et-text-secondary);
    font-size: var(--et-font-size-12);
  }
}

.extlink-row {
  align-items: center;
  display: grid;
  gap: var(--et-space-8);
  grid-template-columns: 92px minmax(0, 1fr) auto;
  margin-bottom: var(--et-space-8);
}

.extlink-list__header {
  color: var(--et-text-secondary);
  display: grid;
  font-size: var(--et-font-size-12);
  gap: var(--et-space-8);
  grid-template-columns: 92px minmax(0, 1fr) auto;
  margin-bottom: var(--et-space-8);
}

.extlink-share-link {
  min-width: 0;

  :deep(.share-link-bar) {
    min-width: 0;
  }
}

.delete-button {
  color: var(--el-color-danger);
}

.extlink-add-row {
  align-items: center;
  display: grid;
  gap: var(--et-space-8);
  grid-template-columns: minmax(0, 1fr) 245px auto;
  margin-bottom: var(--et-space-12);

  .extlink-url {
    color: var(--et-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
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

  strong {
    color: var(--et-text-primary);
  }

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
