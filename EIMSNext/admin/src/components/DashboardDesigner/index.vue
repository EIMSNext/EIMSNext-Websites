<template>
  <EtDrawer v-model="showDrawer" @close="close">
    <template #title>
      <el-input v-model="formName" class="title-editor" />
    </template>
    <EChartDesigner />
  </EtDrawer>
</template>
<script setup lang="ts">
import EChartDesigner from "./EChartDesigner/index.vue";

defineOptions({
  name: "DashboardDesigner",
});

const props = defineProps<{}>();

var showDrawer = ref(true);
const appId = ref("");
const formName = ref("未命名仪表盘");

const emit = defineEmits(["close"]);

function close() {
  emit("close");
}
</script>
<style lang="scss" scoped></style>
