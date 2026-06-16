<template>
  <el-dialog v-model="visible" title="添加收藏" width="640px" destroy-on-close>
    <el-input v-model="keyword" clearable placeholder="输入名称来搜索">
      <template #prefix>
        <et-icon icon="el-search" />
      </template>
    </el-input>
    <el-scrollbar height="420px" class="favorite-tree-scroll">
      <el-tree
        ref="treeRef"
        :data="treeData"
        :filter-node-method="filterNode"
        node-key="id"
        show-checkbox
        default-expand-all
        :props="{ label: 'label', children: 'children', disabled: 'disabled' }"
      />
    </el-scrollbar>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="confirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { WorkbenchCatalogMenu, WorkbenchTargetRequest, WorkbenchTargetType } from "@eimsnext/models";
import { useWorkbenchStore } from "@/store";

interface FavoriteTreeNode {
  id: string;
  label: string;
  targetType?: WorkbenchTargetType;
  targetId?: string;
  disabled?: boolean;
  children?: FavoriteTreeNode[];
}

defineOptions({
  name: "AddFavoriteDialog",
});

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const workbenchStore = useWorkbenchStore();
const { catalog } = storeToRefs(workbenchStore);
const treeRef = ref();
const keyword = ref("");
const saving = ref(false);

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const mapMenus = (menus: WorkbenchCatalogMenu[], appId: string): FavoriteTreeNode[] =>
  menus.map((menu) => {
    if (menu.targetType === "group") {
      return {
        id: `group:${appId}:${menu.id}`,
        label: menu.title,
        disabled: true,
        children: mapMenus(menu.children || [], appId),
      };
    }

    return {
      id: `${menu.targetType}:${menu.id}`,
      label: menu.title,
      targetType: menu.targetType,
      targetId: menu.id,
    };
  });

const treeData = computed<FavoriteTreeNode[]>(() =>
  catalog.value.map((app) => ({
    id: `app:${app.id}`,
    label: app.name,
    targetType: "app",
    targetId: app.id,
    children: mapMenus(app.menus || [], app.id),
  }))
);

const filterNode = (value: string, data: any) => {
  if (!value) return true;
  return data.label.includes(value);
};

const syncCheckedKeys = () => {
  const keys = workbenchStore.favorites.map((item) => `${item.targetType}:${item.targetId}`);
  nextTick(() => {
    treeRef.value?.setCheckedKeys(keys);
  });
};

const confirm = async () => {
  const nodes = (treeRef.value?.getCheckedNodes(false, false) || []) as FavoriteTreeNode[];
  const targets = nodes
    .filter((node) => node.targetType && node.targetId)
    .map(
      (node) =>
        ({
          targetType: node.targetType,
          targetId: node.targetId,
        }) as WorkbenchTargetRequest
    );
  const selectedKeys = new Set(targets.map((target) => `${target.targetType}:${target.targetId}`));

  saving.value = true;
  try {
    const favoritesToRemove = workbenchStore.favorites.filter(
      (favorite) => !selectedKeys.has(`${favorite.targetType}:${favorite.targetId}`)
    );
    for (const favorite of favoritesToRemove) {
      await workbenchStore.removeFavorite({
        targetType: favorite.targetType,
        targetId: favorite.targetId,
      });
    }

    for (const target of targets) {
      if (!workbenchStore.isFavorite(target.targetType, target.targetId)) {
        await workbenchStore.addFavorite(target);
      }
    }
    visible.value = false;
  } finally {
    saving.value = false;
  }
};

watch(keyword, (value) => {
  treeRef.value?.filter(value);
});

watch(
  () => props.modelValue,
  async (value) => {
    if (!value) return;
    await workbenchStore.loadCatalog();
    await workbenchStore.loadFavorites();
    syncCheckedKeys();
  }
);
</script>

<style lang="scss" scoped>
.favorite-tree-scroll {
  margin-top: var(--et-space-12);
}
</style>
