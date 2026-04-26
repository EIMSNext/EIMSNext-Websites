<template>
  <el-drawer v-model="showMessage" header-class="msgcenter-header" title="消息中心" size="70%">
    <div class="page-message-center">
      <div class="message-center-container">
        <div class="message-center-nav">
          <el-menu :default-active="activeMenu" @select="handleMenuSelect">
            <el-menu-item :index="MessageCategory.DataNotify">数据提醒</el-menu-item>
            <el-menu-item :index="MessageCategory.FlowNotify">流程提醒</el-menu-item>
            <el-menu-item :index="MessageCategory.AppNotify">应用消息</el-menu-item>
            <el-menu-item :index="MessageCategory.SystemNotify">系统消息</el-menu-item>
            <el-menu-item :index="MessageCategory.SystemNotice">系统公告</el-menu-item>
          </el-menu>
        </div>
        <div class="message-center-content">
          <div class="message-list">
            <div class="message-list-header">
              <div class="message-filter no-border"></div>
              <div class="read-operation-btn">
                <el-checkbox v-model="unreadOnly">只看未读</el-checkbox>
                <el-link class="link-text read-link" underline="never" @click="handleReadAll">
                  全部转为已读
                </el-link>
              </div>
            </div>
            <div class="message-list-body">
              <template v-if="activeMenu === MessageCategory.DataNotify">
                <message-card v-for="item in pagedMessages" :key="item.id" :message="item" @read="handleRead" />
                <el-empty v-if="pagedMessages.length === 0" description="暂无消息" />
              </template>
              <template v-if="activeMenu === MessageCategory.FlowNotify">
                <message-card v-for="item in pagedMessages" :key="item.id" :message="item" @read="handleRead" />
                <el-empty v-if="pagedMessages.length === 0" description="暂无消息" />
              </template>
              <template v-if="activeMenu === MessageCategory.SystemNotify">
                <message-card v-for="item in pagedMessages" :key="item.id" :message="item" @read="handleRead" />
                <el-empty v-if="pagedMessages.length === 0" description="暂无消息" />
              </template>
              <div class="expire-tip">保存最近六个月的消息记录</div>
            </div>
            <div class="message-list-footer">
              <simple-pagination v-model:current-page="currentPage" :total="totalRef"
                :page-size="pageSize" @change="loadSystemMessages" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useSettingsStore } from "@/store";
import {
  systemMessageApiService,
  systemMessageService,
  ODataQueryRequest,
} from "@eimsnext/services";
import { MessageCategory, SystemMessage } from "@eimsnext/models";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const settingsStore = useSettingsStore();
const activeMenu = ref<MessageCategory>(MessageCategory.DataNotify);
const unreadOnly = ref(false);
const currentPage = ref(1);
const pageSize = 10;
const systemMessages = ref<SystemMessage[]>([]);
const totalRef = ref(0);

const showMessage = computed({
  get() {
    return settingsStore.messageCenterVisible;
  },
  set() {
    settingsStore.messageCenterVisible = false;
  },
});

const pagedMessages = computed(() => {
  return systemMessages.value || [];
});

const getFilter = () => {
  return unreadOnly.value
    ? `Category eq ${activeMenu.value} and isRead eq false`
    : `Category eq ${activeMenu.value}`;
};

const loadTotal = async () => {
  const query = new ODataQueryRequest();
  query.$filter = getFilter();
  totalRef.value = await systemMessageService.count(query);
};

const loadSystemMessages = async () => {
  const query = new ODataQueryRequest();
  query.$filter = getFilter();
  query.$orderby = "createTime desc";
  query.$top = pageSize;
  query.$skip = (currentPage.value - 1) * pageSize;
  systemMessages.value = await systemMessageService.query<SystemMessage>(query);
  await settingsStore.refreshNotificationUnreadCount();
};

const handleRead = async (id?: string) => {
  if (!id) return;
  await systemMessageApiService.read({ id });
  const target = systemMessages.value.find((item) => item.id === id);
  if (target) {
    target.isRead = true;
  }
  await settingsStore.refreshNotificationUnreadCount();
};

const handleReadAll = async () => {
  const ids = systemMessages.value
    .filter((item) => !item.isRead && item.id)
    .map((item) => item.id!);
  if (ids.length === 0) return;

  await systemMessageApiService.readBatch({ keys: ids });
  systemMessages.value.forEach((item) => {
    if (item.id && ids.includes(item.id)) {
      item.isRead = true;
    }
  });
  await settingsStore.refreshNotificationUnreadCount();
};

const handleMenuSelect = (index: string) => {
  activeMenu.value = index as MessageCategory;
  currentPage.value = 1;
  loadTotal();
  loadSystemMessages();
};

watch(unreadOnly, () => {
  currentPage.value = 1;
  loadTotal();
  loadSystemMessages();
});

watch(
  () => showMessage.value,
  async (visible) => {
    if (visible) {
      await loadTotal();
      await loadSystemMessages();
    }
  },
  { immediate: true }
);
</script>
<style scoped lang="scss">
.page-message-center {
  background: var(--et-bg-muted);
  bottom: 0;
  left: 0;
  overflow: auto;
  position: absolute;
  right: 0;
  top: var(--et-size-60);

  .message-center-container {
    display: flex;
    height: 100%;

    .message-center-nav {
      background: var(--et-bg-container);
      display: flex;
      flex: none;
      flex-direction: column;
      gap: var(--et-space-12);
      height: 100%;
      padding: var(--et-space-8) var(--et-space-4);
      width: var(--et-size-214);

      :deep(.el-menu-item.is-active) {
        background-color: var(--et-bg-primary-soft) !important;
        color: var(--et-color-primary) !important;
        border-radius: var(--et-radius-4);
      }

      :deep(.el-menu-item:hover) {
        background-color: var(--et-bg-hover) !important;
      }
    }

    .message-center-content {
      position: relative;
      width: calc(100% - 210px);

      .message-list {
        display: flex;
        flex-direction: column;
        height: 100%;

        .message-list-header {
          align-items: center;
          display: flex;
          justify-content: space-between;
          margin: var(--et-space-16) var(--et-space-16) 0;
          padding: var(--et-space-8) 0;

          .message-filter {
            height: var(--et-size-32);
            width: auto;

            :deep(.el-dropdown-item) {
              &:hover {
                background-color: var(--et-bg-hover) !important;
                border-radius: var(--et-radius-4);
              }

              &.is-selected {
                background-color: var(--et-bg-primary-soft) !important;
                color: var(--et-color-primary) !important;
                border-radius: var(--et-radius-4);
              }
            }
          }

          .message-filter-label {
            display: flex;
            align-items: center;
            cursor: pointer;
          }

          .read-operation-btn {
            align-items: center;
            display: flex;
            gap: var(--et-space-20);
            justify-content: right;
            user-select: none;
          }
        }

        .message-list-body {
          flex: 1;
          overflow: auto;
          padding: 0 var(--et-space-16);
          position: relative;

          .expire-tip {
            align-items: center;
            color: var(--et-text-secondary-soft);
            display: flex;
            gap: var(--et-space-16);
            justify-content: space-between;
            padding: var(--et-space-16) 0;
            width: 100%;

            &:before {
              background: var(--et-border-color-light);
              content: "";
              display: block;
              height: var(--et-z-base);
              flex: 1;
            }

            &:after {
              background: var(--et-border-color-light);
              content: "";
              display: block;
              height: var(--et-z-base);
              flex: 1;
            }
          }
        }

        .message-list-footer {
          margin: 0 var(--et-space-16) var(--et-space-16);
          padding: var(--et-space-12) var(--et-space-32) var(--et-space-8);
        }
      }
    }
  }
}

.read-link {
  padding: 0 var(--et-space-8);
}
</style>
<style>
.msgcenter-header {
  margin-bottom: 0 !important;
  font-size: var(--et-font-size-20);
  font-weight: 700;
  height: var(--et-size-60);
  padding: 0 var(--et-space-20);
  border-bottom: 1px solid var(--et-border-color);
}
</style>
