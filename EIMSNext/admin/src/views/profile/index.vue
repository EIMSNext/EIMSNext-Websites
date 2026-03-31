<template>
  <div class="personal-setting">
    <div class="top-nav-bar">
      <div class="nav-left">
        <el-button class="back-btn" @click="close">
          <et-icon icon="el-ArrowLeft" size="32px" />
        </el-button>
        <span class="nav-text">个人设置</span>
      </div>
    </div>
    <div class="main-container">
      <div class="content">
        <div class="info-container team-name-container">
          <div class="team-current">
            <div :title="contextStore.corpName">
              <span class="team-prefix">{{ t("当前所在企业") }}：</span>
              <span class="team-text">{{ contextStore.corpName }}</span>
            </div>
            <div class="team-label">我创建的</div>
          </div>
        </div>
        <div class="biz-panel info-container team-container">
          <div class="prefixed-label"><span class="title">基本信息</span></div>
          <div class="panel-wrapper rows-layout">
            <div class="panel-row">
              <div class="row-label fixed-label-width">通讯录头像</div>
              <div class="row-content">
                <user-avatar
                  size="24px"
                  :avatar="userStore.currentUser.avatar"
                  :label="userStore.currentUser.empName"
                />
                <el-link type="primary" underline="never" class="link-btn">修改</el-link>
              </div>
            </div>
            <div class="panel-row">
              <div class="row-label fixed-label-width">通讯录姓名</div>
              <div class="row-content">
                <span class="content-row">{{ userStore.currentUser.empName }}</span>
                <el-link type="primary" underline="never" class="link-btn">修改</el-link>
              </div>
            </div>
            <div class="panel-row">
              <div class="row-label fixed-label-width">用户ID</div>
              <div class="row-content">
                <span class="content-row">{{ userStore.currentUser.userId }}</span>
              </div>
            </div>
          </div>
        </div>
        <el-divider class="section-divider" />
        <div class="biz-panel info-container user-container">
          <div class="prefixed-label"><span class="title">账号安全</span></div>
          <div class="panel-wrapper rows-layout">
            <div class="panel-row">
              <div class="row-label fixed-label-width">密码</div>
              <div class="row-content">
                <el-link type="primary" underline="never" class="link-btn">修改</el-link>
              </div>
            </div>
            <div class="panel-row">
              <div class="row-label fixed-label-width">手机</div>
              <div class="row-content">
                <span class="content-row"></span>
                <el-link type="primary" underline="never" class="link-btn">修改</el-link>
                <el-link type="primary" underline="never" class="link-btn">解绑</el-link>
              </div>
            </div>
            <div class="panel-row">
              <div class="row-label fixed-label-width">邮箱</div>
              <div class="row-content">
                <span class="content-row"></span>
                <el-link type="primary" underline="never" class="link-btn">绑定</el-link>
              </div>
            </div>
            <div class="panel-row">
              <div class="row-label fixed-label-width">禁止同时登录</div>
              <div class="row-content">
                <el-switch />
              </div>
            </div>
            <div class="panel-row bind-info-row">
              <div class="row-label fixed-label-width">账号绑定</div>
              <div class="row-content">
                <div class="social-icon">
                  <et-icon icon="wechat" size="24px" color="green" />
                  <span class="item-text">微信</span>
                  <el-link type="primary" underline="never" class="link-btn">解绑</el-link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <el-divider class="section-divider" />
        <div class="biz-panel info-container">
          <div class="panel-wrapper rows-layout">
            <div class="panel-row">
              <div class="row-label fixed-label-width">账号注销</div>
              <div class="row-content">
                <el-link type="primary" underline="never" class="link-btn danger-link">
                  注销
                </el-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";
import { useUserStore, useContextStore } from "@eimsnext/store";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const router = useRouter();
const userStore = useUserStore();
const contextStore = useContextStore();

const close = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/workspace");
  }
};
</script>

<style lang="scss" scoped>
.top-nav-bar {
  box-shadow: var(--et-shadow-sm);
  display: flex;
  font-size: var(--et-font-size-16);
  height: var(--et-size-60);
  justify-content: space-between;
  left: 0;
  line-height: var(--et-line-height-30);
  padding: 0 var(--et-space-10);
  position: fixed;
  right: 0;
  top: 0;
  z-index: var(--et-z-dropdown);
  border-bottom: 1px solid var(--fc-bg-color-2);
  box-shadow: unset;

  .nav-left {
    align-items: center;
    display: flex;
    flex: none;

    .back-btn {
      align-items: center;
      display: flex;
      position: relative;
      padding: var(--et-space-0);
      border: none;
      width: var(--et-size-40);
      background-color: transparent;

      .back-icon {
        cursor: pointer;
        margin-right: var(--et-space-8);
        vertical-align: middle;
      }
    }

    .nav-text {
      margin-left: var(--et-space-8);
      font-size: var(--et-font-size-16);
      font-weight: 600;
      line-height: var(--et-line-height-24);
    }
  }
}

.link-btn {
  padding: 0 var(--et-space-12);
}

.danger-link {
  color: var(--et-color-danger);
}

.fixed-label-width {
  width: var(--et-size-168);
}

.section-divider {
  margin: var(--et-space-8) 0 var(--et-space-24) 0;
}

.personal-setting {
  bottom: 0;
  left: 0;
  overflow: hidden;
  position: absolute;
  right: 0;
  top: 0;
  background-color: var(--et-bg-page);

  .navigation-bar {
    align-items: center;
    color: var(--et-text-primary);
    display: flex;
    font-size: var(--et-font-size-14);
    height: var(--et-size-52);
    justify-content: space-between;
    left: 0;
    padding: 0 var(--et-space-12);
    position: fixed;
    right: 0;
    top: 0;
    z-index: var(--et-z-dropdown);

    .navigation-left {
      align-items: center;
      display: flex;
      flex: none;

      .navigation-bar-back-btn {
        align-items: center;
        display: flex;
        position: relative;

        .back-btn {
          background-color: transparent;
          border: none;
        }

        .nav-text {
          font-size: var(--et-font-size-16);
          font-weight: 600;
          line-height: var(--et-line-height-24);
        }
      }
    }
  }

  .main-container {
    bottom: 0;
    left: 0;
    overflow: auto;
    position: absolute;
    right: 0;
    top: var(--et-size-52);

    .content {
      background-color: var(--et-bg-container);
      border-radius: var(--et-radius-10);
      margin: var(--et-space-20) auto;
      padding: var(--et-space-20);
      width: var(--et-size-980);

      .biz-panel {
        .prefixed-label {
          align-items: center;
          display: flex;
          font-size: var(--et-font-size-16);

          > .title {
            flex-shrink: 0;
            font-weight: 600;
            line-height: var(--et-line-height-24);
          }
        }

        > .panel-wrapper.rows-layout {
          display: flex;
          flex-direction: column;
          padding: var(--et-space-12) var(--et-space-12) 0;

          > .panel-row {
            align-items: baseline;
            display: flex;
            font-size: var(--et-font-size-14);
            line-height: var(--et-line-height-22);
            padding: var(--et-space-16) 0;

            > .row-label {
              color: rgb(19 29 46 / 78%);
              flex-shrink: 0;
              font-weight: 600;
            }

            > .row-content {
              flex: auto;
              display: flex;
              align-items: center;
            }
          }
        }
      }

      .team-name-container {
        background-color: var(--et-bg-muted);
        border-radius: var(--et-radius-6);
        padding: var(--et-space-20);

        .team-current {
          align-items: center;
          display: flex;
          font-size: var(--et-font-size-18);

          .team-text {
            font-weight: 600;
            line-height: var(--et-line-height-26);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .team-prefix {
            font-weight: 400;
          }

          .team-label {
            background-color: rgb(19 29 46 / 8%);
            border-radius: var(--et-radius-6);
            flex: none;
            font-size: var(--et-font-size-14);
            line-height: var(--et-line-height-22);
            margin-left: var(--et-space-16);
            padding: var(--et-space-4) var(--et-space-8);
            text-align: center;
            width: auto;
          }
        }
      }

      .info-container:not(:first-child) {
        margin-top: var(--et-space-24);
      }

      .social-icon {
        align-items: center;
        display: inline-flex;
        margin-right: var(--et-space-20);

        .item-text {
          color: var(--et-text-primary);
          margin-left: var(--et-space-8);
        }

        .not-bind {
          .item-text {
            color: rgb(19 29 46 / 47%);
          }
        }
      }
    }
  }
}
</style>
