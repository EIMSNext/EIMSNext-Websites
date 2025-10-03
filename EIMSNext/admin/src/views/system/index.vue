<template>
  <Layout>
    <el-container>
      <el-aside width="150px" style="border-right: 1px solid var(--el-menu-border-color)">
        <el-menu style="border-right: none">
          <el-menu-item>
            <et-icon icon="iconfont-organization" size="16px" />
            <span class="menu-title">内部组织</span>
          </el-menu-item>
          <el-menu-item>
            <et-icon icon="iconfont-admin" size="16px" />
            <span class="menu-title">管理员</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main style="padding: 0">
        <EmpView />
      </el-main>
    </el-container>
  </Layout>
</template>

<script setup lang="ts">
import Layout from "@/layout/index.vue";
import EmpView from "./employee/index.vue";
</script>

<style lang="scss" scoped>
:deep(.el-container) {
  height: 100%;
}
:deep(.el-menu-item) {
  line-height: 40px;
  height: 40px;
}
.menu-title {
  margin-left: 5px;
}
</style>
