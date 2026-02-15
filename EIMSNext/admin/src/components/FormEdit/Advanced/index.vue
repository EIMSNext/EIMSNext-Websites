<template>
  <div class="adv-container">
    <el-tabs v-model="activeName" tabPosition="left" class="adv-tabs" @tab-click="handleClick">
      <el-tab-pane label="数据推送" name="webpush" class="adv-panel">
        <WebhookList :form-def="formDef" />
      </el-tab-pane>
      <el-tab-pane label="智能助手" name="dataflow" class="adv-panel">
        <DataflowList :form-def="formDef" />
      </el-tab-pane>
      <el-tab-pane label="提醒助手" name="reminder" class="adv-panel" />
      <el-tab-pane label="打印模板" name="print" class="adv-panel">
        <PrintTemplateList :form-def="formDef"></PrintTemplateList>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup lang="ts">
import WebhookList from "./WebhookList.vue";
import DataflowList from "./DataflowList.vue";
import { useSystemStore } from "@/store/system";
import { useFormStore } from "@eimsnext/store";
import { FormDef, EventSourceType } from "@eimsnext/models";
import { TabsPaneContext } from "element-plus";
import PrintTemplateList from "./PrintTemplateList.vue";

defineOptions({
  name: "Advanced",
});

const props = defineProps<{
  formDef: FormDef;
}>();

const systemStore = useSystemStore();
const formStore = useFormStore();
const locale = computed(() => systemStore.locale);

const activeName = ref("dataflow");

const handleClick = (tab: TabsPaneContext, event: Event) => {
  // console.log(tab, event);
};

const emit = defineEmits(["close"]);

function close() {
  emit("close");
}
</script>
<style lang="scss" scoped>
:deep(.adv-tabs.el-tabs--left .el-tabs__nav.is-left) {
  width: 165px !important;
}

:deep(.adv-tabs.el-tabs--left .el-tabs__item.is-left) {
  justify-content: flex-start;
}
</style>
