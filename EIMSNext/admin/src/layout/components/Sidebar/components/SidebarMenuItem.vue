<template>
  <template v-if="currentMenuType === FormType.Group">
    <el-sub-menu :index="groupIndex" teleported ref="subMenuRef" v-model:expanded="expandedKeys">
      <template #title>
        <div
          class="menu-title-row group-drop-target"
          :class="{ 'menu-title-row-expanded': isSidebarOpened }"
          @dragover.prevent
          @drop.stop.prevent="handleGroupDrop"
        >
          <SidebarMenuItemTitle :icon="groupIcon" :title="item.title" :iconColor="getAppIconColor(item)" />
          <span v-if="canEdit || canDelete" class="more-wrapper" @click.stop>
            <el-dropdown placement="bottom-start" size="large" trigger="click">
              <et-icon icon="el-More" @click.prevent="" />
              <template #dropdown>
                <el-dropdown-menu class="sidebar-menu-dropdown">
                  <el-dropdown-item v-if="canEdit" @click="emit('editGroup', item)">
                    <et-icon class="dropdown-item-icon" icon="el-editPen" size="14px" />
                    {{ t("common.edit") }}
                  </el-dropdown-item>
                  <el-divider v-if="canEdit && canDelete" class="sidebar-menu-divider" />
                  <el-dropdown-item v-if="canDelete" class="btn-delete" @click="deleteGroup(item)">
                    <et-icon class="dropdown-item-icon" icon="el-delete" size="14px" />
                    {{ t("common.delete") }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </span>
        </div>
      </template>

      <Draggable v-if="item.subMenus" :list="item.subMenus" item-key="menuId" tag="div" data-menu-type="submenu"
        :group="dragGroup" filter=".more-wrapper, .more-wrapper *" :prevent-on-filter="false" :disabled="!canManage || !sortable" :move="handleSubMenuMove"
        ghost-class="menu-drag-ghost" :animation="180" @start="handleSubMenuDragStart" @end="handleDragEnd"
        @change="handleSubMenuChange">
        <template #item="{ element }">
          <div class="menu-drag-item">
            <SidebarMenuItem :item="element" :app-id="appId" :can-manage="canManage" :sortable="sortable" @editForm="emit('editForm', $event)"
              @editMenu="emit('editMenu', $event)" @editGroup="emit('editGroup', $event)"
              @deleteMenu="emit('deleteMenu', $event)" :on-group-drop="onGroupDrop" :can-drop-to-group="canDropToGroup"
              :on-drag-start="onDragStart" :on-drag-end="onDragEnd" @menusChanged="emit('menusChanged')" />
          </div>
        </template>
      </Draggable>
    </el-sub-menu>
  </template>

  <router-link v-else custom :to="routeTo" v-slot="{ navigate }">
    <el-menu-item
      :index="routeTo.path"
      :class="{ 'pl-15px': !isSidebarOpened, 'menu-item-expanded': isSidebarOpened }"
      @click="() => navigate()"
    >
      <SidebarMenuItemTitle
        :icon="getFormIcon(item)"
        :title="item.title"
        :iconColor="getAppIconColor(item)"
        icon-size="18px"
      />
      <span class="more-wrapper" @click.stop>
        <el-dropdown placement="bottom-start" size="large" trigger="click">
          <et-icon icon="el-More" @click.prevent="" />
          <template #dropdown>
            <el-dropdown-menu class="sidebar-menu-dropdown">
              <el-dropdown-item v-if="canEdit" @click="editForm(item.menuId, currentMenuType)">
                <et-icon class="dropdown-item-icon" icon="el-editPen" size="14px" />
                {{ t("common.edit") }}
              </el-dropdown-item>
              <el-dropdown-item v-if="canEdit" @click="emit('editMenu', item)">
                <et-icon class="dropdown-item-icon" icon="el-setting" size="14px" />
                {{ t("admin.editNameAndIcon") }}
              </el-dropdown-item>
              <el-divider v-if="canEdit && canDelete" class="sidebar-menu-divider" />
              <el-dropdown-item v-if="canDelete" class="btn-delete" @click="deleteGroup(item)">
                <et-icon class="dropdown-item-icon" icon="el-delete" size="14px" />
                {{ t("common.delete") }}
              </el-dropdown-item>
              <el-divider v-if="canEdit || canDelete" class="sidebar-menu-divider" />
              <el-dropdown-item @click="toggleFavorite">
                <et-icon
                  class="dropdown-item-icon"
                  icon="el-star"
                  size="14px"
                  :color="isFavorite ? 'var(--et-color-warning)' : 'currentcolor'"
                />
                {{ t(isFavorite ? "admin.workbench.removeFavorite" : "admin.workbench.addFavorite") }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </span>
    </el-menu-item>
  </router-link>
</template>

<script setup lang="ts">
defineOptions({
  name: "SidebarMenuItem",
  inheritAttrs: false,
});

import { getAppIconColor, getFormIcon } from "@/utils/common";
import { AppMenu, FormType } from "@eimsnext/models";
import { ConfirmResult, EtConfirm } from "@eimsnext/components";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { useSystemStore, useWorkbenchStore } from "@/store";
import Draggable from "vuedraggable";

const { t } = useI18n();
const props = defineProps<{
  item: AppMenu;
  appId: string;
  canManage?: boolean;
  sortable?: boolean;
  onGroupDrop?: (groupMenu: AppMenu) => boolean;
  canDropToGroup?: (groupMenu: AppMenu | undefined, eventTarget: EventTarget | null) => boolean;
  onDragStart?: (menu: AppMenu) => void;
  onDragEnd?: () => void;
}>();

const emit = defineEmits(["editForm", "editMenu", "editGroup", "deleteMenu", "menusChanged"]);
const systemStore = useSystemStore();
const workbenchStore = useWorkbenchStore();
const isSidebarOpened = computed(() => systemStore.sidebar.opened);
const canManage = computed(() => !!props.canManage);
const canEdit = computed(() => canManage.value && props.item.editable !== false);
const canDelete = computed(() => canManage.value && props.item.deletable !== false);
const sortable = computed(() => props.sortable !== false);
const dragGroup = { name: "app-menu", pull: true, put: true };
const groupIndex = computed(() => `group-${props.item.menuId}`);
const subMenuRef = ref();
const expandedKeys = ref<string[]>([]);
const groupIcon = computed(() => expandedKeys.value.includes(groupIndex.value) ? "el-folder-open" : "el-folder");
const getMenuType = (menuType: FormType | number | undefined): FormType => {
  if (menuType === undefined) return FormType.Form;
  if (typeof menuType === 'string') return menuType as FormType;
  return String(menuType) as FormType;
};

const currentMenuType = computed(() => getMenuType(props.item.menuType));
const isFavorite = computed(() =>
  workbenchStore.isFavorite(
    currentMenuType.value === FormType.Dashboard ? "dashboard" : "form",
    props.item.menuId
  )
);
const routeTo = computed(() => ({
  path:
    currentMenuType.value === FormType.Dashboard
      ? `/app/${props.appId}/dash/${props.item.menuId}`
      : `/app/${props.appId}/form/${props.item.menuId}`,
}));

const toggleFavorite = async () => {
  await workbenchStore.loadFavorites();
  await workbenchStore.toggleFavorite({
    targetType: currentMenuType.value === FormType.Dashboard ? "dashboard" : "form",
    targetId: props.item.menuId,
  });
};

function editForm(formId?: string, type?: FormType) {
  if (!canEdit.value) return;

  if (formId && type !== undefined) {
    emit("editForm", { id: formId, type });
  }
}

function handleSubMenuChange() {
  if (!canManage.value || !sortable.value) return;
  emit("menusChanged");
}

function handleGroupDrop() {
  if (!canManage.value || !sortable.value) return;
  if (props.onGroupDrop?.(props.item)) {
    props.onDragEnd?.();
  }
}

function handleSubMenuDragStart(event: { oldIndex?: number }) {
  if (!canManage.value || !sortable.value) return;

  if (event.oldIndex === undefined) return;

  const menu = props.item.subMenus?.[event.oldIndex];
  if (menu) {
    props.onDragStart?.(menu);
  }
}

function handleSubMenuMove(event: { draggedContext?: { element?: AppMenu }; relatedContext?: { element?: AppMenu }; originalEvent?: { target?: EventTarget | null } }) {
  if (!canManage.value || !sortable.value) return false;
  if (event.draggedContext?.element?.editable === false) return false;
  return !props.canDropToGroup?.(event.relatedContext?.element, event.originalEvent?.target ?? null);
}

function handleDragEnd() {
  props.onDragEnd?.();
}

async function deleteGroup(menu: AppMenu) {
  if (!canManage.value || menu.deletable === false) return;

  const menuType = getMenuType(menu.menuType);
  if (menuType === FormType.Group && menu.subMenus && menu.subMenus.length > 0) {
    ElMessage.warning(t("admin.misc.childMenuDeleteBlocked"));
    return;
  }

  const message = menuType === FormType.Group ? t("admin.misc.groupDeleteContent") : t("admin.deleteFormConfirm_Content");
  const confirm = await EtConfirm.showDialog(
    message,
    {
      title: t("admin.deleteFormConfirm_Title", [menu.title || ""]),
    },
    t,
  );

  if (confirm == ConfirmResult.Yes) {
    emit("deleteMenu", menu);
  }
}

onMounted(() => {
  workbenchStore.loadFavorites();
});
</script>

<style lang="scss" scoped>
:deep(.el-sub-menu__icon-arrow) {
  display: none !important;
}

.menu-title-row {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
}

.menu-title-row-expanded {
  padding-right: var(--et-size-30);
}

:deep(.el-menu-item.menu-item-expanded) {
  padding-right: var(--et-size-64) !important;
}

.el-menu-item:hover,
:deep(.el-sub-menu__title:hover) {
  .more-wrapper {
    visibility: visible;
  }
}

.more-wrapper {
  position: absolute;
  right: var(--et-space-10);
  display: flex;
  visibility: hidden;
}

.sidebar-menu-dropdown {
  min-width: var(--et-size-150);
}

.dropdown-item-icon {
  margin-right: var(--et-space-8);
}

.sidebar-menu-divider {
  margin: var(--et-space-3) 0;
}

.menu-drag-ghost {
  opacity: 0.6;
}

.menu-drag-item {
  display: block;
}
</style>
