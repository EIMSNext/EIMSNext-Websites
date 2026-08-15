<template>
  <AddEditApp v-if="showAddEditDialog" :edit="isEditMode" :app="currentApp" @cancel="showAddEditDialog = false"
    @ok="handleSaved"></AddEditApp>
  <et-card :title="t('admin.myApp')" class="my-apps-card" data-workbench-card-root>
    <template #header>
      <div class="workbench-card-header">
        <span class="workbench-card-title">{{ t("admin.myApp") }}</span>
        <div class="workbench-card-actions">
          <el-input
            v-model="keyword"
            clearable
            class="app-search"
            :placeholder="t('admin.appAdmin.searchByName')"
          >
            <template #prefix>
              <et-icon icon="el-search" />
            </template>
          </el-input>
          <el-button v-if="canCreateApp" type="primary" icon="plus" @click="createApp">
            {{ t("admin.newApp") }}
          </el-button>
        </div>
      </div>
    </template>

    <div class="content" data-workbench-height-content>
      <ul class="app-list">
        <li class="app-group">
          <div class="group-name">{{ t("common.other") }}</div>
          <ul class="app-items-container">
            <template v-for="app in filteredApps" :key="app.id">
              <li v-if="app.id !== SYSTEM_APP_ID" class="app-item">
                <div class="item-container">
                  <div class="item-link" @click="gotoApp(app)">
                    <div class="app-wrapper">
                      <div class="app-item-icon">
                        <AppIcon :app="app" />
                      </div>
                      <div class="app-title" :title="app.name">{{ app.name }}</div>
                    </div>
                  </div>
                  <div
                    class="favorite-icon"
                    :class="{ active: workbenchStore.isFavorite('app', app.id) }"
                    @click.stop="toggleFavorite(app)"
                  >
                    <et-icon icon="el-star" size="large"></et-icon>
                  </div>
                  <div v-if="canShowAppActions(app)" class="setting-icon">
                    <el-dropdown placement="bottom-start" size="large">
                      <el-button class="setting-btn">
                        <et-icon icon="el-setting" size="large"></et-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu class="app-dropdown-menu">
                          <el-dropdown-item v-if="canManageApp(app)" @click="handleEditClick(app)">
                            {{ t("admin.editNameAndIcon") }}
                          </el-dropdown-item>
                          <el-dropdown-item v-if="canDeleteApp(app)" class="btn-delete" @click="handleDeleteClick(app)">
                            {{ t("common.delete") }}
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>
              </li>
            </template>
          </ul>
        </li>
      </ul>
    </div>
  </et-card>
</template>
<script setup lang="ts">
defineOptions({
  name: "MyAppsCard",
});
import AddEditApp from "@/views/app/components/AddEditApp.vue";
import { AppDef } from "@eimsnext/models";
import { useAppStore, useContextStore } from "@eimsnext/store";
import { useI18n } from "vue-i18n";
import { ConfirmResult, EtConfirm } from "@eimsnext/components";
import { appDefService } from "@eimsnext/services";
import { useAdminPermissions } from "@/composables/useAdminPermissions";
import { useWorkbenchStore } from "@/store";
import { resolveAppEntryPath } from "@/utils/appEntry";
const { t } = useI18n();

const SYSTEM_APP_ID = "system";

const router = useRouter();
const appStore = useAppStore();
const contextStore = useContextStore();
const workbenchStore = useWorkbenchStore();
const { items: appsRef } = storeToRefs(appStore);
const keyword = ref("");
const showAddEditDialog = ref(false);
const isEditMode = ref(false);
const currentApp = ref<AppDef | undefined>(undefined);
const {
  loadAdminPermissions,
  canCreateApp,
  canManageAppId,
  canDeleteAppId,
} = useAdminPermissions();

const canManageApp = (app: AppDef) => canManageAppId(app.id);
const canDeleteApp = (app: AppDef) => canDeleteAppId(app.id);
const canShowAppActions = (app: AppDef) => canManageApp(app) || canDeleteApp(app);
const refreshAdminPermissions = () => loadAdminPermissions(true);
const filteredApps = computed(() => {
  const searchText = keyword.value.trim().toLocaleLowerCase();
  if (!searchText) return appsRef.value;
  return appsRef.value.filter((app) => app.name.toLocaleLowerCase().includes(searchText));
});

const createApp = () => {
  if (!canCreateApp.value) return;

  isEditMode.value = false;
  currentApp.value = undefined;
  showAddEditDialog.value = true;
};

const handleEditClick = (app: AppDef) => {
  if (!canManageApp(app)) return;

  isEditMode.value = true;
  currentApp.value = app;
  showAddEditDialog.value = true;
};

const handleSaved = async () => {
  showAddEditDialog.value = false;
  isEditMode.value = false;
  currentApp.value = undefined;
  await refreshAdminPermissions();
};

const gotoApp = async (app: AppDef) => {
  await contextStore.setAppId(app.id);
  router.push(resolveAppEntryPath(app));
};

const toggleFavorite = async (app: AppDef) => {
  await workbenchStore.loadFavorites();
  await workbenchStore.toggleFavorite({
    targetType: "app",
    targetId: app.id,
  });
};

const handleDeleteClick = async (app: AppDef) => {
  if (!canDeleteApp(app)) return;

  var confirm = await EtConfirm.showDialog(
    t("admin.deleteAppConfirm_Content"),
    { title: t("admin.deleteAppConfirm_Title", [app?.name]) },
    t
  );
  if (confirm == ConfirmResult.Yes) {
    await appDefService.delete(app.id);
    appStore.remove(app.id, false);
    await refreshAdminPermissions();
  }
};

onMounted(async () => {
  await refreshAdminPermissions();
  await workbenchStore.loadFavorites();
});
</script>
<style lang="scss" scoped>
.my-apps-card {
  height: 100%;

  :deep(.el-card__body) {
    padding-bottom: 0;
  }
}

.workbench-card-header {
  align-items: center;
  display: flex;
  gap: var(--et-space-10);
  width: 100%;
  padding-top: var(--et-space-12);
  padding-bottom: var(--et-space-4);
}

.workbench-card-title {
  color: var(--et-text-primary);
  font-weight: 700;
  font-size: var(--et-font-size-16);
}

.workbench-card-actions {
  align-items: center;
  display: flex;
  gap: var(--et-space-12);
  margin-left: auto;
}

.app-search {
  width: var(--et-size-280);
}

.content {
  .app-list {
    margin: 0 auto;
    padding: 0;

      .app-group {
        padding: var(--et-space-8) 0 0;
      width: 100%;

      .group-name {
        word-wrap: break-word;
        font-size: var(--et-font-size-14);
        font-weight: 700;
        line-height: var(--et-line-height-22);
        word-break: break-word;
      }

      .app-items-container {
        display: grid;
        gap: var(--et-space-8);
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        list-style: none;
        margin: 0;
        padding: var(--et-space-4) 0 0;
        width: 100%;

        .app-item {
          border-radius: var(--et-radius-2);
          margin: 0;
          min-width: 0;
          padding: 0;
          position: relative;
          text-align: center;

          .item-container {
            border: 1px solid transparent;
            border-radius: var(--et-radius-4);
            height: var(--et-size-144);
            overflow: hidden;
            position: relative;
            width: 100%;

            .item-link {
              display: inline-block;
              padding: 0;
              cursor: pointer;
              text-decoration: none;
              height: var(--et-size-144);
              width: 100%;
            }
          }

          .app-wrapper {
            margin: var(--et-space-28) var(--et-space-12) 0;
            -webkit-transition: all 0.2s;
            transition: all 0.2s;

            .app-item-icon {
              display: flex;
              justify-content: center;
              align-items: center;
              height: var(--et-size-72);
            }

            .app-title {
              max-width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              margin-top: var(--et-space-12);
            }
          }

          &:hover {
            background-color: var(--et-bg-page);

            .favorite-icon,
            .setting-icon {
              opacity: 1;
              pointer-events: auto;
              visibility: visible;
            }
          }

          .favorite-icon {
            align-items: center;
            display: flex;
            height: var(--et-size-32);
            justify-content: center;
            left: var(--et-space-10);
            top: var(--et-space-10);
            color: var(--et-text-tertiary);
            cursor: pointer;
            font-size: var(--et-font-size-16);
            line-height: var(--et-line-height-16);
            opacity: 0;
            pointer-events: none;
            position: absolute;
            transition: opacity 0.2s ease;
            visibility: hidden;
            width: var(--et-size-32);

            &.active {
              color: var(--et-color-warning);
            }
          }

          .setting-btn {
            background: transparent;
            border: 0;
            height: var(--et-size-32);
            padding: 0;
            width: var(--et-size-32);

            &:hover {
              background: transparent;
              border: 0;
            }
          }

          .setting-icon {
            align-items: center;
            display: flex;
            height: var(--et-size-32);
            justify-content: center;
            right: var(--et-space-10);
            top: var(--et-space-10);
            color: var(--et-text-tertiary);
            cursor: pointer;
            font-size: var(--et-font-size-16);
            line-height: var(--et-line-height-16);
            opacity: 0;
            pointer-events: none;
            position: absolute;
            transition: opacity 0.2s ease;
            visibility: hidden;
            width: var(--et-size-32);
          }
        }
      }
    }
  }

  .app-remove {
    color: var(--et-color-danger);
  }
}
</style>
<style lang="scss">
.app-menu {
  padding: 0;

  .app-dropdown-menu {
    min-width: var(--et-size-150);
  }

  .app-menu-item {
    padding-left: 0 !important;
    height: var(--et-size-32);
  }

  .app-remove {
    color: var(--et-color-danger);
  }
}
</style>
