<template>
  <template v-if="currentMenuType === FormType.Group">
    <el-sub-menu :index="groupIndex" teleported>
      <template #title>
        <div class="menu-title-row">
          <SidebarMenuItemTitle :icon="getFormIcon(item)" :title="item.title" :iconColor="getAppIconColor(item)" />
          <span v-if="canManage" class="more-wrapper" @click.stop>
            <el-dropdown placement="bottom-start" size="large" trigger="click">
              <et-icon icon="el-More" @click.prevent="" />
              <template #dropdown>
                <el-dropdown-menu class="sidebar-menu-dropdown">
                  <el-dropdown-item @click="emit('editGroup', item)">
                    {{ t("common.edit") }}
                  </el-dropdown-item>
                  <el-divider class="sidebar-menu-divider" />
                  <el-dropdown-item class="btn-delete" @click="deleteGroup(item)">
                    {{ t("common.delete") }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </span>
        </div>
      </template>

      <Draggable v-if="item.subMenus" :list="item.subMenus" item-key="menuId" tag="div" data-menu-type="submenu"
        :group="dragGroup" filter=".more-wrapper, .more-wrapper *" :prevent-on-filter="false"
        ghost-class="menu-drag-ghost" :animation="180" @change="handleSubMenuChange">
        <template #item="{ element }">
          <div class="menu-drag-item">
            <SidebarMenuItem :item="element" :app-id="appId" @editForm="emit('editForm', $event)"
              @editMenu="emit('editMenu', $event)" @editGroup="emit('editGroup', $event)"
              @deleteMenu="emit('deleteMenu', $event)" @menusChanged="emit('menusChanged')" />
          </div>
        </template>
      </Draggable>
    </el-sub-menu>
  </template>

  <router-link v-else custom :to="routeTo" v-slot="{ navigate }">
    <el-menu-item :index="routeTo.path" :class="{ 'pl-15px': !isSidebarOpened }" @click="() => navigate()">
      <SidebarMenuItemTitle :icon="getFormIcon(item)" :title="item.title" :iconColor="getAppIconColor(item)" />
      <span v-if="canManage" class="more-wrapper" @click.stop>
        <el-dropdown placement="bottom-start" size="large" trigger="click">
          <et-icon icon="el-More" @click.prevent="" />
          <template #dropdown>
            <el-dropdown-menu class="sidebar-menu-dropdown">
              <el-dropdown-item @click="editForm(item.menuId, currentMenuType)">
                {{ t("common.edit") }}
              </el-dropdown-item>
              <el-dropdown-item @click="emit('editMenu', item)">
                {{ t("admin.editNameAndIcon") }}
              </el-dropdown-item>
              <el-divider class="sidebar-menu-divider" />
              <el-dropdown-item class="btn-delete" @click="deleteGroup(item)">
                {{ t("common.delete") }}
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
import { useUserStore } from "@eimsnext/store";
import { AppMenu, FormType, UserType } from "@eimsnext/models";
import { ConfirmResult, EtConfirm } from "@eimsnext/components";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { useSystemStore } from "@/store";
import Draggable from "vuedraggable";

const { t } = useI18n();
const props = defineProps<{
  item: AppMenu;
  appId: string;
}>();

const emit = defineEmits(["editForm", "editMenu", "editGroup", "deleteMenu", "menusChanged"]);
const userStore = useUserStore();
const curUser = toRef(userStore.currentUser);
const systemStore = useSystemStore();
const isSidebarOpened = computed(() => systemStore.sidebar.opened);
const canManage = computed(
  () => curUser.value.userType == UserType.CorpOwmer || curUser.value.userType == UserType.CorpAdmin,
);
const dragGroup = { name: "app-menu", pull: true, put: true };
const groupIndex = computed(() => `group-${props.item.menuId}`);
const getMenuType = (menuType: FormType | number | undefined): FormType => {
  if (menuType === undefined) return FormType.Form;
  if (typeof menuType === 'string') return menuType as FormType;
  return String(menuType) as FormType;
};

const currentMenuType = computed(() => getMenuType(props.item.menuType));
const routeTo = computed(() => ({
  path:
    currentMenuType.value === FormType.Dashboard
      ? `/app/${props.appId}/dash/${props.item.menuId}`
      : `/app/${props.appId}/form/${props.item.menuId}`,
}));

function editForm(formId?: string, type?: FormType) {
  if (formId && type !== undefined) {
    emit("editForm", { id: formId, type });
  }
}

function handleSubMenuChange() {
  emit("menusChanged");
}

async function deleteGroup(menu: AppMenu) {
  const menuType = getMenuType(menu.menuType);
  if (menuType === FormType.Group && menu.subMenus && menu.subMenus.length > 0) {
    ElMessage.warning("当前分组下存在子菜单，不能删除");
    return;
  }

  const message = menuType === FormType.Group ? "分组删除后不可恢复" : t("admin.deleteFormConfirm_Content");
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

</script>

<style lang="scss" scoped>
:deep(.el-sub-menu__icon-arrow) {
  display: none !important;
}

.menu-title-row {
  width: 100%;
  display: flex;
  align-items: center;
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
