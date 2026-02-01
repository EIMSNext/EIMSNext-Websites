<template>
    <Layout>
        <!-- 公用侧边栏 -->
        <div class="sidebar-container">
            <!-- 顶部布局顶部 || 左侧布局左侧 -->
            <div style="margin-top:10px">
                <el-menu mode="vertical">
                    <AppLink :to="{
                        path: resolveFullPath('department'),
                    }">
                        <el-menu-item index="department">
                            <et-icon icon="icon-organization" class="step-image" size="14px" />
                            <span class="app-menu-text">内部组织</span>
                        </el-menu-item>
                    </AppLink>
                    <AppLink :to="{
                        path: resolveFullPath('role'),
                    }">
                        <el-menu-item index="role">
                            <et-icon icon="icon-role" class="step-image" size="14px" />
                            <span class="app-menu-text">角色</span>
                        </el-menu-item>
                    </AppLink>
                    <AppLink :to="{
                        path: resolveFullPath('admin'),
                    }">
                        <el-menu-item index="admin">
                            <et-icon icon="icon-admin" class="step-image" size="14px" />
                            <span class="app-menu-text">管理员</span>
                        </el-menu-item>
                    </AppLink>
                </el-menu>
            </div>
        </div>
        <!-- 左侧和顶部布局 -->
        <div class="main-container">
            <SysMain />
            <!-- 返回顶部 -->
            <el-backtop target=".main-container">
                <et-icon icon="backtop" size="24px" />
            </el-backtop>
        </div>
    </Layout>
</template>

<script setup lang="ts">
import Layout from "@/layout/index.vue";
import { useSystemStore } from "@/store";
import SysMain from "./SysMain/index.vue"

const systemStore = useSystemStore();
const isOpenSidebar = computed(() => systemStore.sidebar.opened);

function handleOutsideClick() {
    systemStore.closeSideBar();
}

const wfbasePath = `/system/`;
const resolveFullPath = (routePath: string) => wfbasePath + routePath;

onBeforeMount(async () => {
});
</script>

<style lang="scss" scoped>
.sidebar-container {
    position: fixed;
    z-index: 999;
    width: $sidebar-width;
    background-color: $menu-background;
    transition: width 0.28s;

    :deep(.el-menu) {
        border: none;
    }
}

.main-container {
    position: relative;
    height: 100%;
    margin-left: $sidebar-width;
    overflow-y: auto;
    transition: margin-left 0.28s;

    .fixed-header {
        position: sticky;
        top: 0;
        z-index: 9;
        transition: width 0.28s;
    }
}

// .hideSidebar {
//     .main-container {
//         margin-left: $sidebar-width-collapsed;
//     }
// }

// .layout-left.hideSidebar {
//     .sidebar-container {
//         width: $sidebar-width-collapsed !important;
//     }

//     .main-container {
//         margin-left: $sidebar-width-collapsed;
//     }

.step-image {
    color: #1296db;
}

.app-menu-text {
    margin-left: 5px
}

:deep(.el-menu-item) {
    line-height: 40px;
    height: 40px;
}
</style>