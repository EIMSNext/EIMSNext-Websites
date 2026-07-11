<template>
  <div class="publish-shell">
    <el-tabs v-model="activeName" tab-position="left" class="publish-tabs" :before-leave="beforeTabLeave">
      <el-tab-pane :label="t('admin.publish.internal')" name="member" class="publish-panel">
        <InternalPublish v-if="activeName === 'member'" :form-def="formDef" />
      </el-tab-pane>
      <el-tab-pane :label="t('admin.publish.public')" name="public" class="publish-panel">
        <PublicPublish v-if="activeName === 'public'" ref="publicPanelRef" :form-def="formDef" />
      </el-tab-pane>
      <el-tab-pane :label="t('admin.publish.view')" name="view" class="publish-panel">
        <ViewPublish v-if="activeName === 'view'" :form-def="formDef" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { TabPaneName } from "element-plus";
import { useI18n } from "vue-i18n";
import { FormDef } from "@eimsnext/models";
import InternalPublish from "./InternalPublish.vue";
import PublicPublish from "./PublicPublish.vue";
import ViewPublish from "./ViewPublish.vue";

const { t } = useI18n();
defineOptions({ name: "Publish" });

defineProps<{ formDef: FormDef }>();

const activeName = ref("member");
const publicPanelRef = ref<{ beforeClose: () => Promise<boolean> }>();

const ensurePublicPanelSaved = async () => {
  if (activeName.value !== "public") return true;
  return (await publicPanelRef.value?.beforeClose?.()) ?? true;
};

const beforeTabLeave = async (_newTab: TabPaneName, oldTab: TabPaneName) => {
  if (oldTab !== "public") return true;
  return (await publicPanelRef.value?.beforeClose?.()) ?? true;
};

const beforeClose = async () => {
  return await ensurePublicPanelSaved();
};

defineExpose({
  beforeClose,
});
</script>

<style scoped lang="scss">
.publish-shell {
  height: 100%;
}

.publish-tabs {
  height: 100%;
}

.publish-panel {
  height: 100%;
}

:deep(.publish-tabs.el-tabs--left) {
  height: 100%;
}

:deep(.publish-tabs.el-tabs--left .el-tabs__header) {
  margin-right: 0;
  border-right: 1px solid var(--et-border-color-light);
}

:deep(.publish-tabs.el-tabs--left .el-tabs__nav.is-left) {
  width: 180px;
}

:deep(.publish-tabs.el-tabs--left .el-tabs__item.is-left) {
  justify-content: flex-start;
  min-height: 62px;
  padding: 0 var(--et-space-20);
}

:deep(.publish-tabs.el-tabs--left .el-tabs__content) {
  height: 100%;
}

:deep(.publish-tabs.el-tabs--left .el-tab-pane) {
  height: 100%;
}
</style>
