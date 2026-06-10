<template>
  <div class="adv-container">
    <el-tabs v-model="activeName" tabPosition="left" class="adv-tabs" @tab-click="handleClick">
      <el-tab-pane :label="$t('admin.publish.internal')" name="internal" class="adv-panel">
        <InternalPublish :form-def="formDef" />
      </el-tab-pane>
      <el-tab-pane :label="$t('admin.publish.public')" name="public" class="adv-panel">To do</el-tab-pane>
      <el-tab-pane :label="$t('common.view')" name="view" class="adv-panel">
        <ViewPublish :form-def="formDef" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup lang="ts">
import InternalPublish from "./InternalPublish.vue";
import ViewPublish from "./ViewPublish.vue";
import { FormDef } from "@eimsnext/models";
import { TabsPaneContext } from "element-plus";

defineOptions({
  name: "Publish",
});

const props = defineProps<{
  formDef: FormDef;
}>();

const activeName = ref("internal");

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
