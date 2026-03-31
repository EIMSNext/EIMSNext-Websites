<template>
  <div class="adv-container">
    <el-tabs v-model="activeName" tabPosition="left" class="adv-tabs" @tab-click="handleClick">
      <el-tab-pane label="提醒助手" name="reminder" class="adv-panel">
        <ReminderList :form-def="formDef"></ReminderList>
      </el-tab-pane>
      <el-tab-pane label="打印模板" name="print" class="adv-panel">
        <PrintTemplateList :form-def="formDef"></PrintTemplateList>
      </el-tab-pane>
      <el-tab-pane label="智能助手" name="dataflow" class="adv-panel">
        <DataflowList :form-def="formDef" />
      </el-tab-pane>
      <el-tab-pane label="数据推送" name="webpush" class="adv-panel">
        <WebhookList :form-def="formDef" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup lang="ts">
import ReminderList from "./ReminderList.vue";
import WebhookList from "./WebhookList.vue";
import DataflowList from "./DataflowList.vue";
import PrintTemplateList from "./PrintTemplateList.vue";
import { FormDef } from "@eimsnext/models";
import { TabsPaneContext } from "element-plus";

defineOptions({
  name: "Advanced",
});

const props = defineProps<{
  formDef: FormDef;
}>();

const activeName = ref("reminder");

const handleClick = (_tab: TabsPaneContext, _event: Event) => {};
</script>
<style lang="scss" scoped>
:deep(.adv-tabs.el-tabs--left .el-tabs__nav.is-left) {
  width: var(--et-size-165) !important;
}

:deep(.adv-tabs.el-tabs--left .el-tabs__item.is-left) {
  justify-content: flex-start;
}
</style>
