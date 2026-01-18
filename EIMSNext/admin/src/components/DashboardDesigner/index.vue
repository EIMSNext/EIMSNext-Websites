<template>
  <EtDrawer v-model="showDrawer" @close="close">
    <template #title>
      <el-input v-model="formName" class="title-editor" />
    </template>
    <template #top-right>
      <el-button @click="onSave">保存</el-button>
      <el-button @click="onPreview">预览</el-button>
    </template>
    <el-container class="design-container">
      <el-aside width="250px" class="left-aside">
        <div>aaaaaaaaa</div>
      </el-aside>
      <el-main style="min-width: 460px">
        <div>bbbbbbbbbbbb</div>
      </el-main>
    </el-container>
  </EtDrawer>
  <DataSourceDialog v-model="showDataSourceDialog" :appId="appId" :dataSource="dataSource"></DataSourceDialog>
</template>
<script setup lang="ts">
import { EtDrawer } from "@eimsnext/components/src/drawer";
import { IDataSource } from "./type";

defineOptions({
  name: "DashboardDesigner",
});

const props = defineProps<{
  appId: string;
}>();

var showDrawer = ref(true);
const formName = ref("未命名仪表盘");

const showDataSourceDialog = ref(false)
const dataSource = ref<IDataSource>()


const onSave = () => {
}
const onPreview = () => {
}

const emit = defineEmits(["close"]);
const close = () => {
  emit("close");
}
</script>
<style lang="scss" scoped></style>
