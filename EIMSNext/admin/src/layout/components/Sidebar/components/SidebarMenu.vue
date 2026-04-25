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
      ghost-class="menu-drag-ghost"
      :animation="180"
      @change="emit('menusChanged')"
      :move="onMove"
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

function onMove(evt: any) {
  const dragged = evt.draggedContext?.element as AppMenu | undefined;
  const target = evt.to?.dataset?.menuType;
  const isTargetGroup = target === FormType.Group;
  if (!dragged) {
    return true;
  }

  if (dragged.menuType === FormType.Group) {
    return !isTargetGroup;
  }

  return true;
}

function editForm(formId: string, type: FormType) {
  emit("editForm", formId, type);
}
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
