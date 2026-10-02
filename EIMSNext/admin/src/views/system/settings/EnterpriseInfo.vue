<template>
  <div class="panel-wrapper rows-layout">
    <div class="panel-row">
      <div class="row-label fixed-label-width">企业名称</div>
      <div class="row-content">
        <span class="team-name-wrapper" :title="corpName">{{ corpName }}</span>
        <el-link type="primary" underline="never" class="link-btn" @click="emit('edit-name')">
          修改
        </el-link>
      </div>
    </div>

    <div class="panel-row">
      <div class="row-label fixed-label-width">账号模式</div>
      <div class="row-content">
        <div class="fx-corp-account-mode">
          <div class="account-mode-header">
            <div class="fx-corp-mode-tag">
              <el-tag class="mode-tag" :title="accountModeText" round>
                {{ accountModeText }}
              </el-tag>
            </div>
            <div class="corp-auth-btns">
              <div class="mode-bind-tip">
                如需绑定第三方平台，
                <a class="biz-hyperlink underline" :href="consultUrl" target="_blank" rel="noopener">
                  点此咨询
                </a>
              </div>
            </div>
          </div>

          <div class="corp-detail-wrapper">
            <div class="info-item">
              <span class="item-name">租户 ID</span>
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
import { computed } from "vue";
import { useContextStore, useUserStore } from "@eimsnext/store";
import { PlatformType } from "@eimsnext/models";
import { ElMessage } from "element-plus";

const props = withDefaults(
  defineProps<{
    accountMode?: string;
    consultUrl?: string;
  }>(),
  {
    consultUrl: "#",
  },
);

const emit = defineEmits<{
  (e: "edit-name"): void;
}>();

const contextStore = useContextStore();
const userStore = useUserStore();

const platformLabels: Record<string, string> = {
  [PlatformType.Public]: "公共模式",
  [PlatformType.Wxwork]: "企业微信模式",
  [PlatformType.Ding]: "钉钉模式",
  [PlatformType.Feishu]: "飞书模式",
  [PlatformType.Private]: "私有模式",
};

const accountModeText = computed(() => props.accountMode || platformLabels[contextStore.corpPlat] || "公共模式");
const corpName = computed(() => contextStore.corpName || "—");
const tenantId = computed(() => userStore.currentUser.corpId || "—");

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
    ElMessage.success("租户 ID 已复制");
  } catch {
    ElMessage.warning("复制失败，请手动复制");
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
