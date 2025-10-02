<template>
  <Layout>
    <el-container>
      <el-aside width="150px" style="border-right: 1px solid var(--el-menu-border-color)">
        <el-menu style="border-right: none">
          <el-menu-item>
            <el-icon>
              <document />
            </el-icon>
            部门员工
          </el-menu-item>
          <el-menu-item>
            <el-icon>
              <setting />
            </el-icon>
            设置
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
</style>
