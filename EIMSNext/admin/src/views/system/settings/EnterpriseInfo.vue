<template>
  <div class="panel-wrapper rows-layout">
    <div class="panel-row">
      <div class="row-label fixed-label-width">{{ $t("admin.corpOnboarding.corpName") }}</div>
      <div class="row-content">
        <template v-if="!editing">
          <span class="team-name-wrapper" :title="corpName">{{ corpName }}</span>
          <el-link type="primary" underline="never" class="link-btn" @click="startEdit">
            {{ $t("admin.profile.edit") }}
          </el-link>
        </template>
        <template v-else>
          <div class="name-edit-wrapper">
            <el-input
              ref="nameInputRef"
              v-model="nameDraft"
              class="name-input"
              maxlength="50"
              :placeholder="$t('admin.enterprise.nameEdit.placeholder')"
              :disabled="saving"
              @keyup.enter="confirmEdit"
              @keyup.esc="cancelEdit"
            />
            <span v-if="errorMsg" class="name-edit-error">{{ errorMsg }}</span>
            <el-link type="primary" underline="never" class="link-btn" :disabled="saving" @click="confirmEdit">
              {{ $t("common.ok") }}
            </el-link>
            <el-link type="info" underline="never" class="link-btn" :disabled="saving" @click="cancelEdit">
              {{ $t("common.cancel") }}
            </el-link>
          </div>
        </template>
      </div>
    </div>

    <div class="panel-row">
      <div class="row-label fixed-label-width">{{ $t("admin.enterprise.accountMode") }}</div>
      <div class="row-content">
        <div class="fx-corp-account-mode">
          <div class="account-mode-header">
            <div class="fx-corp-mode-tag">
              <el-tag class="mode-tag" :title="accountModeText" round>
                {{ accountModeText }}
              </el-tag>
            </div>
            <!-- <div class="corp-auth-btns">
              <div class="mode-bind-tip">
                {{ $t("admin.enterprise.bindTip") }}
                <a class="biz-hyperlink underline" :href="consultUrl" target="_blank" rel="noopener">
                  {{ $t("admin.enterprise.consult") }}
                </a>
              </div>
            </div> -->
          </div>

          <div class="corp-detail-wrapper">
            <div class="info-item">
              <span class="item-name">{{ $t("admin.enterprise.tenantId") }}</span>
              <span class="item-value">
                <span class="tenant-id-text">{{ tenantId }}</span>
                <el-button link class="copy-corp-id" type="primary" @click="copyTenantId">
                  <et-icon icon="el-CopyDocument" size="16px" />
                </el-button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { useI18n } from "vue-i18n";
import { corporateService } from "@eimsnext/services";
import { useContextStore, useUserStore } from "@eimsnext/store";
import { PlatformType } from "@eimsnext/models";
import { ElMessage } from "element-plus";

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    accountMode?: string;
    consultUrl?: string;
  }>(),
  {
    consultUrl: "#",
  },
);

const contextStore = useContextStore();
const userStore = useUserStore();

const platformLabels: Record<string, string> = {
  [PlatformType.Public]: t("admin.enterprise.mode.public"),
  [PlatformType.Wxwork]: t("admin.enterprise.mode.wxwork"),
  [PlatformType.Ding]: t("admin.enterprise.mode.ding"),
  [PlatformType.Feishu]: t("admin.enterprise.mode.feishu"),
  [PlatformType.Private]: t("admin.enterprise.mode.private"),
};

const accountModeText = computed(
  () => props.accountMode || platformLabels[contextStore.corpPlat] || t("admin.enterprise.mode.public"),
);
const corpName = computed(() => contextStore.corpName || "—");
const tenantId = computed(() => userStore.currentUser.corpId || "—");

const editing = ref(false);
const saving = ref(false);
const nameDraft = ref("");
const errorMsg = ref("");
const nameInputRef = ref();

const startEdit = () => {
  nameDraft.value = contextStore.corpName || "";
  errorMsg.value = "";
  editing.value = true;
  nextTick(() => nameInputRef.value?.focus());
};

const cancelEdit = () => {
  editing.value = false;
  errorMsg.value = "";
};

const confirmEdit = async () => {
  if (saving.value) return;
  const name = nameDraft.value.trim();
  if (!name) {
    errorMsg.value = t("admin.enterprise.nameEdit.required");
    return;
  }
  if (name.length > 50) {
    errorMsg.value = t("admin.enterprise.nameEdit.tooLong");
    return;
  }
  if (name === contextStore.corpName) {
    editing.value = false;
    return;
  }

  saving.value = true;
  try {
    await corporateService.patch(contextStore.corpId, { id: contextStore.corpId, name });
    contextStore.corpName = name;
    editing.value = false;
    ElMessage.success(t("common.saveSuccess"));
  } catch {
    ElMessage.error(t("common.saveFailed"));
  } finally {
    saving.value = false;
  }
};

const copyTenantId = async () => {
  const value = tenantId.value;
  if (!value || value === "—") {
    return;
  }
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const el = document.createElement("textarea");
      el.value = value;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    ElMessage.success(t("admin.enterprise.messages.copied"));
  } catch {
    ElMessage.warning(t("admin.enterprise.messages.copyFailed"));
  }
};
</script>

<style scoped lang="scss">
.fixed-label-width {
  width: var(--et-size-168);
}

.panel-wrapper.rows-layout {
  display: flex;
  flex-direction: column;
  padding: var(--et-space-12) var(--et-space-12) 0;

  >.panel-row {
    display: flex;
    align-items: baseline;
    font-size: var(--et-font-size-14);
    line-height: var(--et-line-height-22);
    padding: var(--et-space-16) 0;

    >.row-label {
      flex-shrink: 0;
      font-weight: 600;
      color: var(--et-text-primary-soft);
    }

    >.row-content {
      flex: auto;
      display: flex;
      align-items: center;
    }
  }
}

.link-btn {
  padding: 0 var(--et-space-12);
}

.name-edit-wrapper {
  align-items: center;
  display: flex;
  flex: 1;
  min-width: 0;
}

.name-input {
  max-width: 420px;
  width: 320px;
}

.name-edit-error {
  color: var(--el-color-danger);
  flex-shrink: 0;
  font-size: var(--et-font-size-13);
  padding: 0 var(--et-space-8);
  white-space: nowrap;
}

.team-name-wrapper {
  color: var(--et-text-primary);
  font-weight: 500;
  max-width: 420px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fx-corp-account-mode {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-12);
}

.account-mode-header {
  display: flex;
  align-items: center;
  gap: var(--et-space-16);
}

.mode-tag {
  --el-tag-bg-color: var(--et-bg-primary-soft);
  --el-tag-border-color: color-mix(in srgb, var(--et-color-primary) 24%, var(--et-bg-base));
  --el-tag-text-color: var(--et-color-primary);
  height: 24px;
  padding: 0 var(--et-space-12);
  font-weight: 500;
  border: none;
}

.mode-bind-tip {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-13);
  line-height: var(--et-line-height-22);
}

.biz-hyperlink {
  color: var(--et-color-primary);
  cursor: pointer;

  &.underline {
    text-decoration: underline;
  }

  &:hover {
    color: var(--et-color-primary-hover, var(--et-color-primary));
  }
}

.corp-detail-wrapper {
  margin-top: var(--et-space-4);
  padding-top: var(--et-space-16);
  border-top: 1px solid var(--et-border-color-light);
}

.info-item {
  display: flex;
  align-items: center;
  font-size: var(--et-font-size-13);
  line-height: var(--et-line-height-22);
}

.item-name {
  flex-shrink: 0;
  width: 72px;
  color: var(--et-text-secondary);
}

.item-value {
  display: flex;
  align-items: center;
  gap: var(--et-space-8);
  color: var(--et-text-primary);
}

.tenant-id-text {
  letter-spacing: 0.2px;
}

.copy-corp-id {
  font-size: var(--et-font-size-15);
}
</style>
