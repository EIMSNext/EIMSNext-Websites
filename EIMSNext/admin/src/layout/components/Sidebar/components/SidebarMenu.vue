<template>
  <el-menu
    :default-active="currentRoute.path"
    :collapse="!systemStore.sidebar.opened"
    :background-color="variables['menu-background']"
    :text-color="variables['menu-text']"
    :active-text-color="variables['menu-active-text']"
    :style="{ '--el-menu-hover-bg-color': variables['menu-hover'] }"
    :unique-opened="false"
    :collapse-transition="false"
    mode="vertical"
    class="sidebar-menu"
  >
    <Draggable
      :list="menuList"
      item-key="menuId"
      tag="div"
      data-menu-type="root"
      :group="dragGroup"
      filter=".more-wrapper, .more-wrapper *"
      :prevent-on-filter="false"
      :move="handleRootMove"
      ghost-class="menu-drag-ghost"
      :animation="180"
      @start="handleRootDragStart"
      @end="clearDraggingMenu"
      @change="emit('menusChanged')"
    >
      <template #item="{ element }">
        <div class="menu-drag-item">
          <SidebarMenuItem
            :item="element"
            :app-id="appId"
            @editForm="emit('editForm', $event.id, $event.type)"
             @editMenu="emit('editMenu', $event)"
             @editGroup="emit('editGroup', $event)"
             @deleteMenu="emit('deleteMenu', $event)"
             :on-group-drop="moveMenuToGroup"
             :can-drop-to-group="canDropToGroupTitle"
             :on-drag-start="setDraggingMenu"
             :on-drag-end="clearDraggingMenu"
             @menusChanged="emit('menusChanged')"
           />
         </div>
      </template>
    </Draggable>
  </el-menu>
</template>

<script lang="ts" setup>
import variables from "@/styles/variables.module.scss";
import { useSystemStore } from "@/store";
import { AppMenu, FormType } from "@eimsnext/models";
import Draggable from "vuedraggable";

defineOptions({
  name: "SidebarMenu",
});

const props = defineProps<{
  appId: string;
  menuList: AppMenu[];
}>();

const emit = defineEmits(["editForm", "editMenu", "editGroup", "deleteMenu", "menusChanged"]);
const currentRoute = useRoute();
const systemStore = useSystemStore();
const dragGroup = { name: "app-menu", pull: true, put: true };
const draggingMenu = ref<AppMenu>();

const getMenuType = (menuType: FormType | number | undefined): FormType => {
  if (menuType === undefined) return FormType.Form;
  if (typeof menuType === "string") return menuType as FormType;
  return String(menuType) as FormType;
};

const setDraggingMenu = (menu: AppMenu) => {
  draggingMenu.value = menu;
};

const clearDraggingMenu = () => {
  draggingMenu.value = undefined;
};

const handleRootDragStart = (event: { oldIndex?: number }) => {
  if (event.oldIndex === undefined) return;

  const menu = props.menuList[event.oldIndex];
  if (menu) {
    setDraggingMenu(menu);
  }
};

const canDropToGroupTitle = (groupMenu: AppMenu | undefined, eventTarget: EventTarget | null): boolean => {
  const sourceMenu = draggingMenu.value;
  if (!sourceMenu || !groupMenu) return false;
  if (getMenuType(groupMenu.menuType) !== FormType.Group) return false;
  if (getMenuType(sourceMenu.menuType) === FormType.Group) return false;
  return eventTarget instanceof HTMLElement && !!eventTarget.closest(".group-drop-target");
};

const handleRootMove = (event: { relatedContext?: { element?: AppMenu }; originalEvent?: { target?: EventTarget | null } }) => {
  return !canDropToGroupTitle(event.relatedContext?.element, event.originalEvent?.target ?? null);
};

const containsMenu = (menu: AppMenu, targetMenuId: string): boolean => {
  if (menu.menuId === targetMenuId) return true;
  return (menu.subMenus || []).some((subMenu) => containsMenu(subMenu, targetMenuId));
};

const findMenuEntry = (
  menus: AppMenu[],
  menuId: string,
): { menu: AppMenu; list: AppMenu[]; index: number } | undefined => {
  for (let index = 0; index < menus.length; index += 1) {
    const menu = menus[index];
    if (menu.menuId === menuId) {
      return { menu, list: menus, index };
    }

    const matched = findMenuEntry(menu.subMenus || [], menuId);
    if (matched) {
      return matched;
    }
  }

  return undefined;
};

const moveMenuToGroup = (groupMenu: AppMenu): boolean => {
  const sourceMenu = draggingMenu.value;
  if (!sourceMenu || sourceMenu.menuId === groupMenu.menuId) return false;
  if (getMenuType(groupMenu.menuType) !== FormType.Group) return false;
  if (getMenuType(sourceMenu.menuType) === FormType.Group) return false;
  if (containsMenu(sourceMenu, groupMenu.menuId)) return false;

  const sourceEntry = findMenuEntry(props.menuList, sourceMenu.menuId);
  const targetEntry = findMenuEntry(props.menuList, groupMenu.menuId);
  if (!sourceEntry || !targetEntry) return false;

  sourceEntry.list.splice(sourceEntry.index, 1);
  targetEntry.menu.subMenus ||= [];
  targetEntry.menu.subMenus.push(sourceEntry.menu);
  emit("menusChanged");
  return true;
};

</script>

<style lang="scss" scoped>
.sidebar-menu {
  width: 100%;
}

.menu-drag-ghost {
  opacity: 0.6;
}

.menu-drag-item {
  display: block;
}
</style>
