<template>
    <el-drawer v-model="showMessage" header-class="msgcenter-header" title="消息中心" size="70%">
        <div class="page-message-center">
            <div class="message-center-container">
                <div class="message-center-nav">
                    <el-menu default-active="1">
                        <el-menu-item index="1">数据提醒</el-menu-item>
                        <el-menu-item index="2">系统消息</el-menu-item>
                    </el-menu>
                </div>
                <div class="message-center-content">
                    <div class="message-list">
                        <div class="message-list-header">
                            <div class="message-filter no-border"></div>
                            <!-- <el-dropdown class="message-filter no-border" trigger="click">
                                <div class="message-filter-label">
                                    全部 <et-icon icon="el-arrow-down" style="padding-left: 5px;" />
                                </div>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item>全部</el-dropdown-item>
                                        <el-dropdown-item>数据提醒</el-dropdown-item>
                                        <el-dropdown-item>导入导出</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
</el-dropdown> -->
                            <div class="read-operation-btn">
                                <el-checkbox>只看未读</el-checkbox>
                                <el-link class="link-text" style="padding: 0 8px;" :underline="false">全部转为已读</el-link>
                            </div>
                        </div>
                        <div class="message-list-body">
                            <message-card />
                            <message-card />
                            <div class="expire-tip">保存最近六个月的消息记录</div>
                        </div>
                        <div class="message-list-footer">
                            <simple-pagination :total="30" :current-page="2" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </el-drawer>
</template>

<script setup lang="ts">
import { useSettingsStore } from "@/store";
import { useI18n } from "vue-i18n";
const { t } = useI18n()

const settingsStore = useSettingsStore();

const showMessage = computed({
    get() {
        return settingsStore.messageCenterVisible;
    },
    set() {
        settingsStore.messageCenterVisible = false;
    },
});

</script>
<style scoped lang="scss">
.page-message-center {
    background: #f7f8fa;
    bottom: 0;
    left: 0;
    overflow: auto;
    position: absolute;
    right: 0;
    top: 60px;

    .message-center-container {
        display: flex;
        height: 100%;

        .message-center-nav {
            background: #fff;
            display: flex;
            flex: none;
            flex-direction: column;
            gap: 12px;
            height: 100%;
            padding: 8px 4px;
            width: 214px;

            :deep(.el-menu-item.is-active) {
                background-color: #e6f7ff !important;
                color: #1890ff !important;
                border-radius: 4px;
            }

            :deep(.el-menu-item:hover) {
                background-color: #f0f7ff !important;
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
                    margin: 16px 16px 0;
                    padding: 8px 0;

                    .message-filter {
                        height: 32px;
                        width: auto;

                        :deep(.el-dropdown-item) {
                            &:hover {
                                background-color: #f0f7ff !important;
                                border-radius: 4px;
                            }

                            &.is-selected {
                                background-color: #e6f7ff !important;
                                color: #1890ff !important;
                                border-radius: 4px;
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
                        gap: 20px;
                        justify-content: right;
                        user-select: none;
                    }
                }

                .message-list-body {
                    flex: 1;
                    overflow: auto;
                    padding: 0 16px;
                    position: relative;

                    .expire-tip {
                        align-items: center;
                        color: rgba(19, 29, 46, 0.66);
                        display: flex;
                        gap: 16px;
                        justify-content: space-between;
                        padding: 16px 0;
                        width: 100%;

                        &:before {
                            background: #e6ede8;
                            content: "";
                            display: block;
                            height: 1px;
                            flex: 1;
                        }

                        &:after {
                            background: #e6ede8;
                            content: "";
                            display: block;
                            height: 1px;
                            flex: 1;
                        }
                    }
                }

                .message-list-footer {
                    margin: 0 16px 16px;
                    padding: 12px 32px 8px;
                }
            }
        }
    }
}
</style>
<style>
.msgcenter-header {
    margin-bottom: 0 !important;
    font-size: 20px;
    font-weight: 700;
    height: 60px;
    padding: 0 20px;
    border-bottom: 1px solid var(--et-color-border);
}
</style>