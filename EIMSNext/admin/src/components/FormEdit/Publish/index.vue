<template>
  <el-tabs v-model="activeName" tabPosition="left" class="adv-container" @tab-click="handleClick">
    <el-tab-pane label="内部发布" name="internal" class="adv-panel">
      <InternalPublish :form-def="formDef" />
    </el-tab-pane>
    <el-tab-pane label="公开发布" name="public" class="adv-panel">
      To do
    </el-tab-pane>
  </el-tabs>
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
.adv-container {
  height: 100%;

  .adv-panel {
    height: 100%;
  }
}
</style>
