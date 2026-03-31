<template>
  <AddEditApp
    v-if="showAddEditDialog"
    :edit="isEditMode"
    :app="currentApp"
    @cancel="showAddEditDialog = false"
    @ok="handleSaved"
  ></AddEditApp>
  <et-card :title="t('admin.myApp')">
    <template #action>
      <el-button
        v-if="curUser.userType == UserType.CorpOwmer || curUser.userType == UserType.CorpAdmin"
        icon="plus"
        @click="createApp"
      >
        {{ t("admin.newApp") }}
      </el-button>
    </template>

    <div class="content">
      <ul class="app-list">
        <li class="app-group">
          <div class="group-name">{{ t("common.other") }}</div>
          <ul class="app-items-container">
            <el-space>
              <template v-for="app in appsRef">
                <li v-if="app.id != 'system'" class="app-item">
                  <div class="item-container">
                    <div class="item-link" @click="gotoApp(app)">
                      <div class="app-wrapper">
                        <div class="app-item-icon">
                          <et-icon
                            :icon="getAppIcon(app)"
                            size="48px"
                            :color="getAppIconColor()"
                          ></et-icon>
                        </div>
                        <div class="app-title">{{ app.name }}</div>
                      </div>
                    </div>
                    <div class="favorite-icon">
                      <et-icon icon="el-star" size="large"></et-icon>
                    </div>
                    <div
                      v-if="
                        curUser.userType == UserType.CorpOwmer ||
                        curUser.userType == UserType.CorpAdmin
                      "
                      class="setting-icon"
                    >
                      <el-dropdown placement="bottom-start" size="large">
                        <el-button class="setting-btn">
                          <et-icon icon="el-setting" size="large"></et-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu class="app-dropdown-menu">
                            <el-dropdown-item @click="handleEditClick(app)">
                              {{ t("admin.editNameAndIcon") }}
                            </el-dropdown-item>
                            <el-dropdown-item class="btn-delete" @click="handleDeleteClick(app)">
                              {{ t("common.delete") }}
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </div>
                </li>
              </template>
            </el-space>
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
import { App, UserType } from "@eimsnext/models";
import { useAppStore, useContextStore, useUserStore } from "@eimsnext/store";
import { getAppIcon, getAppIconColor } from "@/utils/common";
import { useI18n } from "vue-i18n";
import { ConfirmResult, EtConfirm } from "@eimsnext/components";
const { t } = useI18n();

const router = useRouter();
const appStore = useAppStore();
const contextStore = useContextStore();
const { items: appsRef } = storeToRefs(appStore);
const userStore = useUserStore();
const curUser = toRef(userStore.currentUser);
const showAddEditDialog = ref(false);
const isEditMode = ref(false);
const currentApp = ref<App | undefined>(undefined);

const createApp = () => {
  isEditMode.value = false;
  currentApp.value = undefined;
  showAddEditDialog.value = true;
};

const handleEditClick = (app: App) => {
  isEditMode.value = true;
  currentApp.value = app;
  showAddEditDialog.value = true;
};

const handleSaved = () => {
  showAddEditDialog.value = false;
  isEditMode.value = false;
  currentApp.value = undefined;
};

const gotoApp = async (app: App) => {
  await contextStore.setAppId(app.id);
  const path = "/app/" + app.id + "/mytasks";
  router.push(path);
};
const handleDeleteClick = async (app: App) => {
  var confirm = await EtConfirm.showDialog(
    t("admin.deleteFormConfirm_Content"),
    { title: t("admin.deleteFormConfirm_Title", [app?.name]) },
    t
  );
  if (confirm == ConfirmResult.Yes) {
    appStore.remove(app.id);
  }
};
</script>
<style lang="scss" scoped>
.content {
  .app-list {
    margin: 0 auto;
    padding: 0;

    .app-group {
      padding: var(--et-space-8) 0;
      width: 100%;

      .group-name {
        word-wrap: break-word;
        font-size: var(--et-font-size-14);
        font-weight: 700;
        line-height: var(--et-line-height-22);
        word-break: break-word;
      }

      .app-items-container {
        padding-top: var(--et-space-4);
        width: 100%;

        .app-item {
          border-radius: var(--et-radius-2);
          float: left;
          left: 0;
          margin: var(--et-space-8) 0;
          min-width: var(--et-size-172);
          padding: 0 var(--et-space-6);
          position: relative;
          text-align: center;
          width: 16%;

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
              margin-top: var(--et-space-12);
            }
          }

          &:hover {
            background-color: var(--et-bg-page);

            .favorite-icon {
              visibility: visible;
            }

            .setting-icon {
              visibility: visible;
            }
          }

          .favorite-icon {
            display: block;
            left: var(--et-space-10);
            top: var(--et-space-10);
            color: var(--et-text-tertiary);
            cursor: pointer;
            font-size: var(--et-font-size-16);
            line-height: var(--et-line-height-16);
            position: absolute;
            visibility: hidden;
          }

          .setting-btn {
            border: none;
            background-color: var(--et-bg-page);

            &:hover {
              border: none;
            }
          }

          .setting-icon {
            display: block;
            right: var(--et-space-10);
            top: var(--et-space-10);
            color: var(--et-text-tertiary);
            cursor: pointer;
            font-size: var(--et-font-size-16);
            line-height: var(--et-line-height-16);
            position: absolute;
            visibility: hidden;
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
