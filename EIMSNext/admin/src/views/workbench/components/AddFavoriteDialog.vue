<template>
  <et-dialog
    v-model="visible"
    class="workbench-selection-dialog"
    :title="t('admin.workbench.addFavorite')"
    width="640px"
    destroy-on-close
  >
    <div class="workbench-dialog-content">
      <el-input v-model="keyword" clearable :placeholder="t('admin.appAdmin.searchByName')">
        <template #prefix><et-icon icon="el-search" /></template>
      </el-input>
      <el-scrollbar height="420px" class="favorite-tree-scroll">
        <el-tree
          ref="treeRef"
          :data="treeData"
          :filter-node-method="filterNode"
          node-key="id"
          default-expand-all
          :props="{ label: 'label', children: 'children' }"
          @node-click="toggleNode"
        >
          <template #default="{ data }">
            <div class="favorite-tree-node" :class="{ selected: isSelected(data) }">
              <span v-if="data.kind === 'app'" class="tree-app-icon" :style="{ backgroundColor: data.iconColor }">
                <et-icon :icon="data.icon" color="#fff" size="12px" />
              </span>
              <et-icon v-else class="tree-icon" :icon="data.icon" :style="{ color: data.iconColor }" size="18px" />
              <span class="tree-label" :title="data.label">{{ data.label }}</span>
              <el-checkbox
                v-if="data.targetType && data.targetId"
                :model-value="isSelected(data)"
                @click.stop
                @change="setSelected(data, $event)"
              />
            </div>
          </template>
        </el-tree>
      </el-scrollbar>
    </div>
    <template #footer>
      <div class="el-dialog__footer footer-wrapper">
        <div class="footer-left"></div>
        <div class="footer-right">
          <el-button :disabled="saving" @click="visible = false">{{ t("common.cancel") }}</el-button>
          <el-button type="primary" :loading="saving" :disabled="saving" @click="confirm">{{ t("common.ok") }}</el-button>
        </div>
      </div>
    </template>
  </et-dialog>
</template>

<script setup lang="ts">
import {
  FormType,
  type AppDef,
  type AppMenu,
  type WorkbenchCatalogMenu,
  type WorkbenchTargetRequest,
  type WorkbenchTargetType,
} from "@eimsnext/models";
import { useWorkbenchStore } from "@/store";
import { getAppIcon, getAppIconColor, getFormIcon } from "@/utils/common";
import { useI18n } from "vue-i18n";

interface FavoriteTreeNode {
  id: string;
  label: string;
  kind: "app" | "group" | "target";
  icon: string;
  iconColor: string;
  targetType?: WorkbenchTargetType;
  targetId?: string;
  children?: FavoriteTreeNode[];
}

defineOptions({ name: "AddFavoriteDialog" });

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: "update:modelValue", value: boolean): void }>();

const workbenchStore = useWorkbenchStore();
const { t } = useI18n();
const { catalog } = storeToRefs(workbenchStore);
const treeRef = ref();
const keyword = ref("");
const saving = ref(false);
const selectedKeys = ref<string[]>([]);

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const getMenuIcon = (menu: WorkbenchCatalogMenu) =>
  getFormIcon({
    menuId: menu.id,
    menuType:
      menu.targetType === "dashboard"
        ? FormType.Dashboard
        : menu.targetType === "group"
          ? FormType.Group
          : FormType.Form,
    icon: menu.icon,
    iconColor: menu.iconColor,
  } as AppMenu);

const getMenuIconColor = (menu: WorkbenchCatalogMenu) =>
  getAppIconColor({
    iconColor: menu.iconColor,
    menuType: menu.targetType === "dashboard" ? FormType.Dashboard : FormType.Form,
  });

const mapMenus = (menus: WorkbenchCatalogMenu[], appId: string): FavoriteTreeNode[] =>
  menus.map((menu) => ({
    id: `${menu.targetType}:${appId}:${menu.id}`,
    label: menu.title,
    kind: menu.targetType === "group" ? "group" : "target",
    icon: getMenuIcon(menu),
    iconColor: getMenuIconColor(menu),
    targetType: menu.targetType === "group" ? undefined : menu.targetType,
    targetId: menu.targetType === "group" ? undefined : menu.id,
    children: mapMenus(menu.children || [], appId),
  }));

const treeData = computed<FavoriteTreeNode[]>(() =>
  catalog.value.map((app) => ({
    id: `app:${app.id}`,
    label: app.name,
    kind: "app" as const,
    icon: getAppIcon(app as unknown as AppDef),
    iconColor: getAppIconColor(app),
    targetType: "app",
    targetId: app.id,
    children: mapMenus(app.menus || [], app.id),
  }))
);

const filterNode = (value: string, data: any) => !value || data.label.includes(value);
const targetKey = (node: FavoriteTreeNode) =>
  node.targetType && node.targetId ? `${node.targetType}:${node.targetId}` : "";
const isSelected = (node: FavoriteTreeNode) => selectedKeys.value.includes(targetKey(node));

const setSelected = (node: FavoriteTreeNode, checked: boolean | string | number) => {
  const key = targetKey(node);
  if (!key) return;
  const next = new Set(selectedKeys.value);
  if (checked) next.add(key);
  else next.delete(key);
  selectedKeys.value = [...next];
};

const toggleNode = (node: FavoriteTreeNode) => {
  if (node.targetType && node.targetId) setSelected(node, !isSelected(node));
};

const getSelectedTargets = () => {
  const selected = new Set(selectedKeys.value);
  const targets: WorkbenchTargetRequest[] = [];
  const visit = (nodes: FavoriteTreeNode[]) => {
    nodes.forEach((node) => {
      const key = targetKey(node);
      if (key && node.targetType && node.targetId && selected.has(key)) {
        targets.push({ targetType: node.targetType, targetId: node.targetId });
      }
      visit(node.children || []);
    });
  };
  visit(treeData.value);
  return targets;
};

const confirm = async () => {
  if (saving.value) return;
  const targets = getSelectedTargets();
  const selected = new Set(targets.map((target) => `${target.targetType}:${target.targetId}`));

  saving.value = true;
  try {
    const favoritesToRemove = workbenchStore.favorites.filter(
      (favorite) => !selected.has(`${favorite.targetType}:${favorite.targetId}`)
    );
    const targetsToAdd = targets.filter(
      (target) => !workbenchStore.isFavorite(target.targetType, target.targetId)
    );
    await Promise.all([
      ...favoritesToRemove.map((favorite) =>
        workbenchStore.removeFavorite({ targetType: favorite.targetType, targetId: favorite.targetId })
      ),
      ...targetsToAdd.map((target) => workbenchStore.addFavorite(target)),
    ]);
    visible.value = false;
  } catch (error) {
    console.error("保存收藏失败：", error);
    ElMessage.error(t("common.saveFailed"));
  } finally {
    saving.value = false;
  }
};

watch(keyword, (value) => treeRef.value?.filter(value));
watch(
  () => props.modelValue,
  async (value) => {
    if (!value) return;
    keyword.value = "";
    await workbenchStore.loadCatalog();
    await workbenchStore.loadFavorites();
    selectedKeys.value = workbenchStore.favorites.map(
      (item) => `${item.targetType}:${item.targetId}`
    );
  }
);
</script>

<style lang="scss" scoped>
.workbench-dialog-content {
  padding: var(--et-space-16) var(--et-space-20) 0;
}

.favorite-tree-scroll {
  margin-top: var(--et-space-12);
  margin-bottom: var(--et-space-12);
  :deep(.el-scrollbar__view) {
    box-sizing: border-box;
    padding-right: var(--et-space-16);
  }
}

.favorite-tree-node {
  align-items: center;
  display: flex;
  gap: var(--et-space-8);
  height: var(--et-size-30);
  line-height: var(--et-line-height-30);
  min-width: 0;
  width: 100%;

  &.selected {
    color: var(--et-color-primary);
    font-weight: 600;
  }
}

.tree-app-icon {
  align-items: center;
  border-radius: var(--et-radius-4);
  display: inline-flex;
  flex: 0 0 var(--et-size-18);
  height: var(--et-size-18);
  justify-content: center;
  width: var(--et-size-18);
}

.tree-icon { flex: 0 0 var(--et-size-18); }

.tree-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.el-checkbox {
  flex: 0 0 auto;
  margin-left: auto;
}

:deep(.el-tree-node__content) {
  height: var(--et-size-30);
  line-height: var(--et-line-height-30);
}
</style>
