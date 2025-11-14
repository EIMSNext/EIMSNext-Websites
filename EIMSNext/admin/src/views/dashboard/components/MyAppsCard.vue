<template>
  <AddEditApp v-if="showAddEditDialog" :edit="false" @cancel="showAddEditDialog = false" @ok="handleSaved"></AddEditApp>
  <et-card title="我的应用">
    <template #action>
      <el-button icon="plus" @click="createApp">创建新应用</el-button>
    </template>

    <div class="content">
      <ul class="app-list">
        <li class="app-group">
          <div class="group-name">其他</div>
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
                    <div class="setting-icon">
                      <el-popover trigger="click">
                        <template #reference>
                          <et-icon icon="el-icon-setting" size="large"></et-icon>
                        </template>
                        <el-menu class="app-menu">
                          <el-menu-item class="app-menu-item">修改名称和图标</el-menu-item>
                          <!-- <el-menu-item class="app-menu-item">移动</el-menu-item>
                          <el-menu-item class="app-menu-item">复制</el-menu-item> -->
                          <el-menu-item class="app-menu-item app-remove" @click="handleDeleteClick(app)">
                            删除
                          </el-menu-item>
                        </el-menu>
                      </el-popover>
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
import { App } from "@eimsnext/models";
import { useAppStore, useContextStore, useFormStore } from "@eimsnext/store";
import { getAppIcon, getAppIconColor } from "@/utils/common";

const router = useRouter();
const appStore = useAppStore();
const contextStore = useContextStore();
const { items: appsRef } = storeToRefs(appStore);
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
const handleDeleteClick = (app: App) => {
  appStore.remove(app.id)
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
            background: #fff;
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
            .favorite-icon {
              display: block;
            }

            .setting-icon {
              display: block;
            }
          }

          .favorite-icon {
            display: none;
            left: 10px;
            top: 10px;
            color: #838892;
            cursor: pointer;
            font-size: 16px;
            line-height: 16px;
            position: absolute;
          }

          .setting-icon {
            display: none;
            right: 10px;
            top: 10px;
            color: #838892;
            cursor: pointer;
            font-size: 16px;
            line-height: 16px;
            position: absolute;
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
