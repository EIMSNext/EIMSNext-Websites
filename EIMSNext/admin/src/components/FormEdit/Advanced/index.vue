<template>
  <el-tabs v-model="activeName" tabPosition="left" class="adv-container" @tab-click="handleClick">
    <el-tab-pane label="智能助手" name="dataflow" class="adv-panel">
      <DataflowList :form-def="formDef" />
    </el-tab-pane>
    <el-tab-pane label="提醒助手" name="reminder" class="adv-panel" />
    <el-tab-pane label="打印模板" name="print" class="adv-panel">
      <PrintTemplateList :form-def="formDef"></PrintTemplateList>
    </el-tab-pane>
  </el-tabs>
</template>
<script setup lang="ts">
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
  console.log(tab, event);
};

const emit = defineEmits(["close"]);

function close() {
  emit("close");
}
</script>
<style lang="scss" scoped>
.adv-container {
  height: 100%;

  .adv-panel {
    height: 100%;
  }
}
</style>
