<template>
  <div class="layout-container-settings">
    <div class="setting-label">标题</div>
    <el-input v-model="title" size="small" @change="emitUpdated" />
    <el-checkbox v-model="setting.showTitle" @change="emitUpdated">显示标题</el-checkbox>

    <div class="setting-row setting-label">
      <span>标签页</span>
      <el-switch v-model="tabsEnabled" size="small" />
    </div>

    <template v-if="tabsEnabled">
      <el-select v-model="setting.tabStyle" class="tab-style-select" @change="emitUpdated">
        <el-option v-for="style in tabStyles" :key="style.value" :label="style.label" :value="style.value">
          <div class="tab-style-option">
            <span>{{ style.label }}</span>
            <span class="style-preview" :class="style.value"><i>标签页1</i><i>标签页2</i><i>标签页3</i></span>
          </div>
        </el-option>
      </el-select>

      <div class="setting-row setting-label">
        <span>自动轮播</span>
        <el-switch v-model="setting.autoRotate" size="small" @change="emitUpdated" />
      </div>

      <Draggable v-model="setting.tabs" item-key="id" handle=".drag-handle" class="tab-list" @end="emitUpdated">
        <template #item="{ element: tab }">
          <div class="tab-list-item">
            <et-icon icon="el-Operation" class="drag-handle" />
            <el-input v-model="tab.name" size="small" @change="emitUpdated" />
            <el-button link :disabled="setting.tabs.length === 1 || tabHasItems(tab.id)" :title="tabHasItems(tab.id) ? '页签内存在组件，不能删除' : '删除页签'" @click="removeTab(tab.id)">
              <et-icon icon="el-delete" />
            </el-button>
          </div>
        </template>
      </Draggable>
      <el-button class="add-tab" plain size="small" @click="addTab"><et-icon icon="el-Plus" /> 添加</el-button>
    </template>
  </div>
</template>

<script setup lang="ts">
import Draggable from "vuedraggable";
import { uniqueId } from "@eimsnext/utils";
import { computed, reactive, ref, watch } from "vue";
import { ILayoutContainerSetting, LayoutContainerTabStyle, createDefaultLayoutContainerTabs } from "./type";

const props = defineProps<{ modelValue: ILayoutContainerSetting; title: string; tabHasItems: (tabId: string) => boolean }>();
const emit = defineEmits<{ updated: [payload: { name: string; setting: ILayoutContainerSetting }] }>();

const setting = reactive<ILayoutContainerSetting>(structuredClone(props.modelValue));
const title = ref(props.title);
const tabStyles: Array<{ value: LayoutContainerTabStyle; label: string }> = [
  { value: "underline", label: "下划线" },
  { value: "boxed", label: "卡片" },
  { value: "filled", label: "填充" },
  { value: "scroll", label: "滚动" },
];
const tabsEnabled = computed({
  get: () => setting.mode === "tabs",
  set: (enabled: boolean) => {
    setting.mode = enabled ? "tabs" : "normal";
    if (enabled && setting.tabs.length === 0) setting.tabs = createDefaultLayoutContainerTabs();
    emitUpdated();
  },
});

watch(() => props.modelValue, (value) => Object.assign(setting, structuredClone(value)), { deep: true });
watch(() => props.title, (value) => { title.value = value; });

function emitUpdated() { emit("updated", { name: title.value || "未命名布局容器", setting: structuredClone(setting) }); }
function addTab() { setting.tabs.push({ id: uniqueId(), name: `标签页${setting.tabs.length + 1}` }); emitUpdated(); }
function removeTab(id: string) { if (setting.tabs.length > 1 && !props.tabHasItems(id)) { setting.tabs = setting.tabs.filter((tab) => tab.id !== id); emitUpdated(); } }
</script>

<style scoped lang="scss">
.layout-container-settings { width: 288px; display: flex; flex-direction: column; gap: var(--et-space-8); }
.setting-label { color: var(--et-text-primary); font-weight: 600; font-size: var(--et-font-size-14); }
.setting-row { display: flex; justify-content: space-between; align-items: center; margin-top: var(--et-space-6); }
.tab-style-select { width: 100%; }
.tab-style-option { display: flex; justify-content: space-between; align-items: center; gap: var(--et-space-12); }
.style-preview { display: flex; align-items: flex-end; height: 24px; overflow: hidden; color: var(--et-text-secondary); }
.style-preview i { font-style: normal; font-size: 10px; padding: 3px 6px; white-space: nowrap; }
.style-preview.underline { border-bottom: 2px solid var(--et-color-primary); }.style-preview.underline i:first-child { color: var(--et-color-primary); border-bottom: 2px solid var(--et-color-primary); }
.style-preview.boxed i { border: 1px solid var(--et-border-color); }.style-preview.boxed i:first-child { color: var(--et-color-primary); border-color: var(--et-color-primary); }
.style-preview.filled { background: var(--et-bg-page); }.style-preview.filled i:first-child { color: #fff; background: var(--et-color-primary); }
.style-preview.scroll { border-bottom: 2px solid var(--et-color-primary); }.style-preview.scroll::before, .style-preview.scroll::after { content: "‹"; font-size: 16px; color: var(--et-text-secondary); }.style-preview.scroll i:first-of-type { color: #fff; background: var(--et-color-primary); border-radius: 3px; }
.tab-list { display: flex; flex-direction: column; gap: var(--et-space-6); }.tab-list-item { display: flex; align-items: center; gap: var(--et-space-6); }.drag-handle { color: var(--et-text-secondary); cursor: grab; }.tab-list-item :deep(.el-input) { flex: 1; }.add-tab { width: 100%; }
</style>
