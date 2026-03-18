<template>
  <div class="personal-setting">
    <div class="top-nav-bar">
      <div class="nav-left"><el-button class="back-btn" @click="close">
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
              <span style="font-weight: normal;"> {{ t("当前所在企业") }}：</span><span class="team-text">{{
                contextStore.corpName }} </span>
            </div>
            <div class="team-label">我创建的</div>
          </div>
        </div>
        <div class="biz-panel info-container team-container">
          <div class="prefixed-label"><span class="title">基本信息</span></div>
          <div class="panel-wrapper rows-layout">
            <div class="panel-row">
              <div class="row-label" style="width: 168px;">通讯录头像</div>
              <div class="row-content">
                <user-avatar size="24px" :avatar="userStore.currentUser.avatar"
                  :label="userStore.currentUser.empName" />
                <el-link type="primary" underline="never" class="link-btn">修改</el-link>
              </div>
            </div>
            <div class="panel-row">
              <div class="row-label" style="width: 168px;">通讯录姓名</div>
              <div class="row-content"><span class="content-row">{{
                userStore.currentUser.empName }}</span>
                <el-link type="primary" underline="never" class="link-btn">修改</el-link>
              </div>
            </div>
            <div class="panel-row">
              <div class="row-label" style="width: 168px;">用户ID</div>
              <div class="row-content"><span class="content-row">{{ userStore.currentUser.userId }}</span></div>
            </div>
          </div>
        </div>
        <el-divider style="margin: 8px 0 24px 0" />
        <div class="biz-panel info-container user-container">
          <div class="prefixed-label"><span class="title">账号安全</span></div>
          <div class="panel-wrapper rows-layout">
            <div class="panel-row">
              <div class="row-label" style="width: 168px;">密码</div>
              <div class="row-content"><el-link type="primary" underline="never" class="link-btn">修改</el-link></div>
            </div>
            <div class="panel-row">
              <div class="row-label" style="width: 168px;">手机</div>
              <div class="row-content"><span class="content-row"></span>
                <el-link type="primary" underline="never" class="link-btn">修改</el-link><el-link type="primary"
                  underline="never" class="link-btn">解绑</el-link>
              </div>
            </div>
            <div class="panel-row">
              <div class="row-label" style="width: 168px;">邮箱</div>
              <div class="row-content"><span class="content-row"></span><el-link type="primary" underline="never"
                  class="link-btn">绑定</el-link></div>
            </div>
            <div class="panel-row">
              <div class="row-label" style="width: 168px;">禁止同时登录</div>
              <div class="row-content">
                <el-switch />
              </div>
            </div>
            <div class="panel-row bind-info-row">
              <div class="row-label" style="width: 168px;">账号绑定</div>
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
        <el-divider style="margin: 8px 0 24px 0" />
        <div class="biz-panel info-container">
          <div class="panel-wrapper rows-layout">
            <div class="panel-row">
              <div class="row-label" style="width: 168px;">账号注销</div>
              <div class="row-content"> <el-link type="primary" underline="never" class="link-btn"
                  style="color: #fd7d79;">注销</el-link></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore, useContextStore } from '@eimsnext/store';
import { useI18n } from 'vue-i18n';
const { t } = useI18n()

const router = useRouter()
const userStore = useUserStore()
const contextStore = useContextStore()

const close = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/workspace');
  }
}
</script>

<style lang="scss" scoped>
.top-nav-bar {
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  font-size: 16px;
  height: 60px;
  justify-content: space-between;
  left: 0;
  line-height: 30px;
  padding: 0 10px;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 100;
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
      padding: 0px;
      border: none;
      width: 40px;
      background-color: transparent;

      .back-icon {
        cursor: pointer;
        margin-right: 8px;
        vertical-align: middle;
      }
    }

    .nav-text {
      margin-left: 8px;
      font-size: 16px;
      font-weight: 600;
      line-height: 24px;
    }
  }

}


.link-btn {
  padding: 0 12px;
}

.personal-setting {
  bottom: 0;
  left: 0;
  overflow: hidden;
  position: absolute;
  right: 0;
  top: 0;
  background-color: #f3f3f8;

  .navigation-bar {
    align-items: center;
    color: var(--et-color-text);
    display: flex;
    font-size: 14px;
    height: 52px;
    justify-content: space-between;
    left: 0;
    padding: 0 12px;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 100;

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
          font-size: 16px;
          font-weight: 600;
          line-height: 24px;
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
    top: 52px;

    .content {
      background-color: #fff;
      border-radius: 10px;
      margin: 20px auto;
      padding: 20px;
      width: 980px;

      .biz-panel {
        .prefixed-label {
          align-items: center;
          display: flex;
          font-size: 16px;

          >.title {
            flex-shrink: 0;
            font-weight: 600;
            line-height: 24px;
          }
        }

        >.panel-wrapper.rows-layout {
          display: flex;
          flex-direction: column;
          padding: 12px 12px 0;

          >.panel-row {
            align-items: baseline;
            display: flex;
            font-size: 14px;
            line-height: 22px;
            padding: 16px 0;

            >.row-label {
              color: rgba(19, 29, 46, 0.78);
              flex-shrink: 0;
              font-weight: 600;
            }

            >.row-content {
              flex: auto;
              display: flex;
              align-items: center;
            }
          }

        }
      }

      .team-name-container {
        background-color: #f7f8fa;
        border-radius: 6px;
        padding: 20px;

        .team-current {
          align-items: center;
          display: flex;
          font-size: 18px;

          .team-text {
            font-weight: 600;
            line-height: 26px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .team-label {
            background-color: rgba(19, 29, 46, 0.08);
            border-radius: 6px;
            flex: none;
            font-size: 14px;
            line-height: 22px;
            margin-left: 16px;
            padding: 4px 8px;
            text-align: center;
            width: auto;
          }
        }
      }

      .info-container:not(:first-child) {
        margin-top: 24px;
      }

      .social-icon {
        align-items: center;
        display: inline-flex;
        margin-right: 20px;

        .item-text {
          color: rgba(19, 29, 46, 1);
          margin-left: 8px;
        }

        .not-bind {
          .item-text {
            color: rgba(19, 29, 46, 0.47);
          }
        }
      }
    }
  }
}
</style>
