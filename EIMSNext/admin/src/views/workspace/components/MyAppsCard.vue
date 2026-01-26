<template>
  <AddEditApp v-if="showAddEditDialog" :edit="false" @cancel="showAddEditDialog = false" @ok="handleSaved"></AddEditApp>
  <et-card :title="t('admin.myApp')">
    <template #action>
      <el-button v-if="curUser.userType == UserType.CorpOwmer || curUser.userType == UserType.CorpAdmin" icon="plus"
        @click="createApp">{{ t("admin.newApp") }}</el-button>
    </template>

    <div class="content">
      <ul class="app-list">
        <li class="app-group">
          <div class="group-name">{{ t("common.other") }}</div>
          <ul class="app-items-container">
            <el-space>
              <template v-for="app in appsRef">
                <li v-if="app.id != 'system'" class="app-item" style="width: 16%">
                  <div class="item-container">
                    <div class="item-link" @click="gotoApp(app)">
                      <div class="app-wrapper">
                        <div class="app-item-icon">
                          <et-icon :icon="getAppIcon(app)" size="48px" :color="getAppIconColor()"></et-icon>
                        </div>
                        <div class="app-title">{{ app.name }}</div>
                      </div>
                    </div>
                    <div class="favorite-icon">
                      <et-icon icon="el-icon-star" size="large"></et-icon>
                    </div>
                    <div v-if="curUser.userType == UserType.CorpOwmer || curUser.userType == UserType.CorpAdmin"
                      class="setting-icon">
                      <el-dropdown placement="bottom-start" size="large">
                        <el-button class="setting-btn">
                          <et-icon icon="el-icon-setting" size="large"></et-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu style="min-width: 150px">
                            <el-dropdown-item>{{ t("admin.editNameAndIcon") }}</el-dropdown-item>
                            <el-dropdown-item class="btn-delete" @click="handleDeleteClick(app)">{{ t("common.delete")
                            }}</el-dropdown-item>
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
import { EtConfirm } from "@eimsnext/components";
const { t } = useI18n()

const router = useRouter();
const appStore = useAppStore();
const contextStore = useContextStore();
const { items: appsRef } = storeToRefs(appStore);
const userStore = useUserStore()
const curUser = toRef(userStore.currentUser)
const showAddEditDialog = ref(false);

const createApp = () => {
  showAddEditDialog.value = true;
};
const handleSaved = () => {
  showAddEditDialog.value = false;
};

const gotoApp = async (app: App) => {
  await contextStore.setAppId(app.id);
  const path = "/app/" + app.id + "/mytasks";
  router.push(path);
};
const handleDeleteClick = async (app: App) => {
  var confirm = await EtConfirm.showDialog(t("admin.deleteFormConfirm_Content"), { title: t('admin.deleteFormConfirm_Title', [app?.name]) }, t)
  if (confirm) {
    appStore.remove(app.id)
  }
};
</script>
<style lang="scss" scoped>
.content {
  .app-list {
    margin: 0 auto;
    padding: 0;

    .app-group {
      padding: 8px 0;
      width: 100%;

      .group-name {
        word-wrap: break-word;
        font-size: 14px;
        font-weight: 700;
        line-height: 22px;
        word-break: break-word;
      }

      .app-items-container {
        padding-top: 4px;
        width: 100%;

        .app-item {
          border-radius: 2px;
          float: left;
          left: 0;
          margin: 8px 0;
          min-width: 172px;
          padding: 0 6px;
          position: relative;
          text-align: center;
          width: 16%;

          .item-container {
            border: 1px solid transparent;
            border-radius: 4px;
            height: 144px;
            overflow: hidden;
            position: relative;
            width: 100%;

            .item-link {
              display: inline-block;
              padding: 0;
              cursor: pointer;
              text-decoration: none;
              height: 144px;
              width: 100%;
            }
          }

          .app-wrapper {
            margin: 27px 12px 0;
            -webkit-transition: all 0.2s;
            transition: all 0.2s;

            .app-item-icon {
              display: inline-block;
              vertical-align: middle;
            }

            .app-title {
              margin-top: 12px;
            }
          }

          &:hover {
            background-color: var(--et-bg-color-primary);

            .favorite-icon {
              visibility: visible
            }

            .setting-icon {
              visibility: visible
            }
          }

          .favorite-icon {
            display: block;
            left: 10px;
            top: 10px;
            color: #838892;
            cursor: pointer;
            font-size: 16px;
            line-height: 16px;
            position: absolute;
            visibility: hidden;
          }

          .setting-btn {
            border: none;
            background-color: var(--et-bg-color-primary);

            &:hover {
              border: none;
            }
          }

          .setting-icon {
            display: block;
            right: 10px;
            top: 10px;
            color: #838892;
            cursor: pointer;
            font-size: 16px;
            line-height: 16px;
            position: absolute;
            visibility: hidden;
          }
        }
      }
    }
  }

  .app-remove {
    color: var(--el-color-danger);
  }
}
</style>
<style lang="scss">
.app-menu {
  padding: 0;

  .app-menu-item {
    padding-left: 0 !important;
    height: 32px;
  }

  .app-remove {
    color: var(--el-color-danger);
  }
}
</style>
