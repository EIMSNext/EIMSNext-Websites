<template>
  <div class="adv-container">
    <el-tabs v-model="activeName" tabPosition="left" class="adv-tabs" @tab-click="handleClick">
      <el-tab-pane :label="$t('admin.advanced.dataCollab')" name="advanced-data" class="adv-panel">
        <DataAdvanced :form-def="formDef" />
      </el-tab-pane>
      <el-tab-pane :label="$t('admin.advanced.notify')" name="notify" class="adv-panel">
        <NotifyList :form-def="formDef"></NotifyList>
      </el-tab-pane>
      <el-tab-pane :label="$t('admin.advanced.print')" name="print" class="adv-panel">
        <PrintDefList :form-def="formDef"></PrintDefList>
      </el-tab-pane>
      <el-tab-pane :label="$t('admin.advanced.eventFlow')" name="eventFlow" class="adv-panel">
        <EventFlowList :form-def="formDef" />
      </el-tab-pane>
      <el-tab-pane :label="$t('admin.advanced.webhook')" name="webpush" class="adv-panel">
        <WebhookList :form-def="formDef" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup lang="ts">
import DataAdvanced from "./DataAdvanced.vue";
import NotifyList from "./NotifyList.vue";
import WebhookList from "./WebhookList.vue";
import EventFlowList from "./EventFlowList.vue";
import PrintDefList from "./PrintDefList.vue";
import { FormDef } from "@eimsnext/models";
import { TabsPaneContext } from "element-plus";

defineOptions({
  name: "Advanced",
});

const props = defineProps<{
  formDef: FormDef;
  initialTab?: string;
}>();

const activeName = ref(props.initialTab || "advanced-data");

const handleClick = (_tab: TabsPaneContext, _event: Event) => {};
</script>
<style lang="scss" scoped>
:deep(.adv-tabs.el-tabs--left .el-tabs__nav.is-left) {
  width: var(--et-size-165) !important;
}

:deep(.adv-tabs.el-tabs--left .el-tabs__item.is-left) {
  justify-content: flex-start;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background: var(--et-bg-hover);
  }

  &.is-active {
    background: var(--et-bg-primary-soft);
  }
}
</style>
