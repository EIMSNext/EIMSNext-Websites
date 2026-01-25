<template>
  <div class="adv-container">
    <el-tabs v-model="activeName" tabPosition="left" class="adv-tabs" @tab-click="handleClick">
      <el-tab-pane label="内部发布" name="internal" class="adv-panel">
        <InternalPublish :form-def="formDef" />
      </el-tab-pane>
      <el-tab-pane label="公开发布" name="public" class="adv-panel">
        To do
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup lang="ts">
import InternalPublish from "./InternalPublish.vue";
import { FormDef, EventSourceType } from "@eimsnext/models";
import { TabsPaneContext } from "element-plus";
import { useLocale } from "element-plus";
const { t } = useLocale()

defineOptions({
  name: "Publish",
});

const props = defineProps<{
  formDef: FormDef;
}>();

const activeName = ref("internal");

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
