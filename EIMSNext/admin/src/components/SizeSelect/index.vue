<template>
  <!-- 布局大小 -->
  <el-tooltip :content="t('sizeSelect.tooltip')" effect="dark" placement="bottom">
    <el-dropdown trigger="click" @command="handleSizeChange">
      <div>
        <et-icon icon="size" />
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="item of sizeOptions"
            :key="item.value"
            :disabled="appStore.size == item.value"
            :command="item.value"
          >
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-tooltip>
</template>

<script setup lang="ts">
import { SizeEnum } from "@/enums/SizeEnum";
import { useSystemStore } from "@/store/system";
import { useLocale } from "element-plus";

const { t } = useLocale();
const sizeOptions = computed(() => {
  return [
    { label: t("sizeSelect.default"), value: SizeEnum.DEFAULT },
    { label: t("sizeSelect.large"), value: SizeEnum.LARGE },
    { label: t("sizeSelect.small"), value: SizeEnum.SMALL },
  ];
});

const appStore = useSystemStore();
function handleSizeChange(size: string) {
  appStore.changeSize(size);
  ElMessage.success(t("sizeSelect.message.success"));
}
</script>
