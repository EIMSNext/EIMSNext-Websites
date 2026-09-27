<template>
  <div class="adv-container">
    <el-tabs v-model="activeName" tab-position="left" class="adv-tabs" :before-leave="beforeTabLeave">
      <el-tab-pane :label="t('admin.publish.internal')" name="member" class="adv-panel">
        <InternalPublish v-if="activeName === 'member'" :form-def="formDef" />
      </el-tab-pane>
      <el-tab-pane :label="t('admin.publish.public')" name="public" class="adv-panel">
        <PublicPublish v-if="activeName === 'public'" ref="publicPanelRef" :form-def="formDef" />
      </el-tab-pane>
      <el-tab-pane :label="t('admin.publish.view')" name="view" class="adv-panel">
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
